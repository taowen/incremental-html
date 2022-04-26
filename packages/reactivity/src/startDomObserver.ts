import { morphChildNodes, morphInnerHTML } from '@incremental-html/morph';
import { effect, isRef, reactive } from '@vue/reactivity';

const nodeVersions = reactive<Record<string, number>>({});
const rawNode = Symbol();
let nextId = 1;
let nextVer = 1;

const mutationObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
        if (mutation.attributeName) {
            notifyNodeSubscribers((mutation.target as any).$xid)
        }
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            const addedNode = mutation.addedNodes.item(i)!;
            if (addedNode.nodeType === 1) {
                mountNode(addedNode as Element);
            }
        }
        for (let i = 0; i < mutation.removedNodes.length; i++) {
            const removedNode = mutation.removedNodes.item(i) as Element;
            if (removedNode.nodeType === 1 && removedNode.getAttribute('on:unmount')) {
                callEventHandler('unmount', removedNode, removedNode.getAttribute('on:unmount')!);
            }
        }
    }
});

export function startDomObserver() {
    mountNode(document.body);
}

export function stopDomObserver() {
    mutationObserver.disconnect();
    delete (document.body as any).$xid;
}

const syncEvaluator = Function.apply(null, ['expr', 'arguments', "return eval('expr = undefined;' + expr)"]);
function evalSync(expr: string, theThis?: any, ...args: any[]) {
    return syncEvaluator.apply(theThis, [expr, args]);
}


const asyncEvaluator = Function.apply(null, ['expr', 'arguments', "return eval('expr = undefined; (async() => {' + expr + '})();')"]);
function evalAsync(expr: string, theThis?: any, ...args: any[]) {
    return asyncEvaluator.apply(theThis, [expr, args]);
}

function subscribeNode(node?: Element | null) {
    if (!node) {
        return;
    }
    const xid = (node as any).$xid;
    if (xid) {
        nodeVersions[xid]; // read from reactive object to subscribe
    }
}

function notifyNodeSubscribers(xid: string) {
    nodeVersions[xid] = nextVer++;
}

function mountNode(node: Element) {
    if ((node as any).$xid) {
        return (node as any).$xid;
    }
    const xid = `n${nextId++}`;
    (node as any).$xid = xid;
    if (node.tagName === 'INPUT') {
        node.addEventListener('input', () => {
            const ref = (node as any).$valueRef;
            if (ref) {
                ref.value = (node as HTMLInputElement).value;
            }
            notifyNodeSubscribers(xid);
        });
        const superProps = Object.getPrototypeOf(node);
        const superSet = Object.getOwnPropertyDescriptor(superProps, "value")!.set!;
        const superGet = Object.getOwnPropertyDescriptor(superProps, "value")!.get!;
        Object.defineProperty(node, "value", {
            get: function () {
                return superGet.apply(this[rawNode] || this);
            },
            set: function (t) {
                if (isRef(t)) {
                    this.$valueRef = t;
                    t = t.value;
                } else {
                    delete this.$valueRef;
                }
                superSet.call(this[rawNode] || this, t);
                notifyNodeSubscribers(xid);
            }
        });
    }
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name === 'on:mount') {
            callEventHandler('mount', node, attr.value);
        } else if (attr.name === 'on:unmount') {
            // ignore
        } else if (attr.name.startsWith('on:')) {
            const eventName = attr.name.substring('on:'.length);
            node.addEventListener(eventName, (...args) => {
                args[0].preventDefault();
                callEventHandler(eventName, args[0].target!, attr.value, ...args);
            })
        } else if (attr.name.startsWith('prop:')) {
            const propName = camelize(attr.name.substring('prop:'.length));
            setNodeProperty(node, propName, evalSync(attr.value, elementProxy(node)));
        } else if (attr.name.startsWith('use:')) {
            const featureClass = evalSync(attr.value, elementProxy(node));
            const featureName = camelize(attr.name.substring('use:'.length));
            setNodeProperty(node, featureName, new featureClass({ element: node }));
        }
    }
    effect(() => {
        refreshNode(node);
    })
    for (let i = 0; i < node.children.length; i++) {
        mountNode(node.children[i])
    }
    mutationObserver.observe(node, {
        attributes: true,
        attributeOldValue: false,
        childList: true,
        subtree: false
    });
    return xid;
}

async function callEventHandler(eventName: string, node: EventTarget, eventHandler: string | Function, ...args: any[]) {
    try {
        if (typeof eventHandler === 'string') {
            return await evalAsync(eventHandler, node, ...args);
        } else {
            return await eventHandler.apply(node, args);
        }
    } catch (e) {
        console.error('failed to handle ' + eventName, { e });
        return undefined;
    }
}

export function featureOf<T>(element: Element, featureClass: { new(props: any): T }): T | undefined {
    const featureElement = element.closest(`[use\\:${hyphenate(featureClass.name)}]`);
    if (featureElement) {
        const featureName = featureClass.name.charAt(0).toLowerCase() + featureClass.name.slice(1);
        return (featureElement as any)[featureName]
    }
    return undefined;
}

export function $(selector: any) {
    if (selector[0] !== '#') {
        throw new Error('not implemented');
    }
    const elem = document.getElementById(selector.substring(1));
    if (!elem) {
        return undefined;
    }
    subscribeNode(elem);
    return elementProxy(elem);
}

function elementProxy(target: Element): any {
    return new Proxy(target, {
        get(target, p, receiver) {
            if (p === rawNode) {
                return target;
            }
            const v = (target as any)[p];
            if (typeof v === 'function') {
                return (...args: any[]) => {
                    const ret = v.apply(target, args);
                    if (ret.nodeType === 1) {
                        subscribeNode(ret);
                    }
                    return ret;
                }
            }
            return v;
        }
    })
}

function refreshNode(node: Element) {
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name.startsWith('bind:')) {
            try {
                const newValue = evalSync(attr.value, elementProxy(node));
                setNodeProperty(node, camelize(attr.name.substring('bind:'.length)), newValue);
            } catch (e) {
                console.error(`failed to eval ${attr.name}`, { node, e });
            }
        }
    }
}

function setNodeProperty(node: Element, name: string, value: any) {
    if (name.startsWith('style.')) {
        Reflect.set((node as HTMLElement).style, name.substring('style.'.length), value)
        return;
    }
    if (name.startsWith('class.')) {
        value = ' ' + value;
        const oldClass = Reflect.get(node, name);
        Reflect.set(node, name, value);
        if (oldClass) {
            node.className = node.className.replace(oldClass, '') + value;
        } else {
            node.className = node.className + value;
        }
        return;
    }
    if (name === 'innerHtml') {
        morphInnerHTML(node, value);
        return;
    }
    if (name === 'childNodes') {
        morphChildNodes(node, Array.isArray(value) ? value : [value]);
        return;
    }
    Reflect.set(node, name, value);
}

const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
    const cache: Record<string, string> = Object.create(null)
    return ((str: string) => {
        const hit = cache[str]
        return hit || (cache[str] = fn(str))
    }) as any
}

const camelizeRE = /-(\w)/g
const camelize = cacheStringFunction((str: string): string => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
})

const hyphenateRE = /\B([A-Z])/g
const hyphenate = cacheStringFunction((str: string) =>
    str.replace(hyphenateRE, '-$1').toLowerCase()
)