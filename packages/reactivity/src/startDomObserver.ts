import { effect, isRef, reactive } from '@vue/reactivity';
import morphdom from 'morphdom';

const nodeVersions = reactive<Record<string, number>>({});
const rawNode = Symbol();
let nextId = 1;
let nextVer = 1;

// html will lowercase attribute name
const lookup: Record<string, string> = {
    'bind:textcontent': 'textContent'
}

const mutationObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
        if (mutation.attributeName) {
            notifyNodeSubscribers((mutation.target as any).$xid)
        }
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            const addedNode = mutation.addedNodes.item(i)!;
            if (addedNode.nodeType === 1) {
                registerNode(addedNode as Element);
            }
        }
    }
});

export function startDomObserver() {
    (window as any).$ = $;
    registerNode(document.documentElement || document.body);
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

function registerNode(node: Element) {
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
    effect(() => {
        refreshNode(node);
    })
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name.startsWith('on:')) {
            const eventName = attr.name.substring('on:'.length);
            node.addEventListener(eventName, (...args) => {
                args[0].preventDefault();
                (async () => {
                    try {
                        await evalAsync(attr.value, args[0].target, ...args);
                    } catch (e) {
                        console.error('failed to handle ' + eventName, { e });
                    }
                })();
            })
        }
    }
    for (let i = 0; i < node.children.length; i++) {
        registerNode(node.children[i])
    }
    mutationObserver.observe(node, {
        attributes: true,
        attributeOldValue: false,
        childList: true,
        subtree: false
    });
    return xid;
}

function $(selector: any) {
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
                setAttribute(node, attr.name, newValue);
            } catch (e) {
                console.error(`failed to eval ${attr.name}`, { node, e });
            }
        }
    }
}

function setAttribute(node: Element, name: string, value: any) {
    if (name.startsWith('bind:style.')) {
        let key = lookup[name.substring('bind:style.'.length)];
        if (!key) {
            key = name.substring('bind:style.'.length);
        }
        Reflect.set((node as HTMLElement).style, key, value)
        return;
    }
    if (name === 'bind:innerhtml') {
        if (typeof value === 'string') {
            const newNode = document.createElement('div');
            newNode.innerHTML = value;
            updateChildNodesIncrementally(node, newNode);
        } else {
            setChildNodes(node, value);
        }
        return;
    }
    if (name === 'bind:childnodes') {
        setChildNodes(node, value);
        return;
    }
    let key = lookup[name];
    if (!key) {
        key = name.substring('bind:'.length);
    }
    Reflect.set(node, key, value);
}

function setChildNodes(node: Element, value: any) {
    const newNode = document.createElement('div');
    if (Array.isArray(value)) {
        for (const child of value) {
            newNode.appendChild(child);
        }
    } else {
        newNode.appendChild(value);
    }
    updateChildNodesIncrementally(node, newNode);
}

function updateChildNodesIncrementally(node: Element, newNode: Element) {
    morphdom(node, newNode, {
        getNodeKey(node) {
            if (node.nodeType === 1) {
                return (node as Element).id;
            }
            return '';
        },
        onBeforeElUpdated(fromEl, toEl) {
            (fromEl as any).$props = (toEl as any).$props;
            return true;
        },
        onBeforeElChildrenUpdated(fromEl, toEl) {
            if (toEl.getAttribute('bind:innerhtml') || toEl.getAttribute('bind:childNodes') || toEl.getAttribute('bind:textcontent')) {
                refreshNode(fromEl);
                return false;
            }
            return true;
        },
        childrenOnly: true
    })
}