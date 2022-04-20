import { effect, reactive } from '@vue/reactivity';
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
        notifyNodeSubscribers((mutation.target as Element).getAttribute('xid') as string)
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
    const xid = node.getAttribute('xid');
    if (xid) {
        nodeVersions[xid]; // read from reactive object to subscribe
    }
}

function notifyNodeSubscribers(xid: string) {
    nodeVersions[xid] = nextVer++;
}

function registerNode(node: Element) {
    if (node.getAttribute('xid')) {
        return;
    }
    const xid = `n${nextId++}`;
    node.setAttribute('xid', xid);
    refreshNode(node);
    if (node.tagName === 'INPUT') {
        node.addEventListener('input', () => {
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
                superSet.call(this[rawNode] || this, t);
                notifyNodeSubscribers(xid);
            }
        });
    }
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name === 'oninit' || attr.name === 'on:init') {
            evalSync(attr.value);
        } else if (attr.name.startsWith('on:')) {
            node.addEventListener(attr.name.substring('on:'.length), (...args) => {
                args[0].preventDefault();
                evalAsync(attr.value, node, ...args);
            })
        }
    }
    for (let i = 0; i < node.children.length; i++) {
        registerNode(node.children[i])
    }
    mutationObserver.observe(node, {
        attributes: true,
        attributeOldValue: false,
        childList: true
    });
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
    effect(() => {
        for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            if (attr.name.startsWith('bind:')) {
                setAttribute(node, attr.name, evalSync(attr.value, elementProxy(node)));
            }
        }
    })
}

function setAttribute(node: Element, name: string, value: any) {
    if (name.startsWith('bind:style.')) {
        let key = lookup[name.substring('bind:style.'.length)];
        if (!key) {
            key = name.substring('bind:style.'.length);
        }
        return Reflect.set((node as HTMLElement).style, key, value);
    }
    if (name === 'bind:innerhtml') {
        const newNode = document.createElement('div');
        newNode.innerHTML = value;
        morphdom(node, newNode, {
            getNodeKey(node) {
                if (node.nodeType === 1) {
                    return (node as Element).id;
                }
                return '';
            },
            childrenOnly: true
        })
        return;
    }
    let key = lookup[name];
    if (!key) {
        key = name.substring('bind:'.length);
    }
    Reflect.set(node, key, value);
}