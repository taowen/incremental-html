import { effect, reactive } from '@vue/reactivity';

var domObserver = new MutationObserver(function (mutation) {
    // TODO: register new nodes
});

const nodeVersions = reactive<Record<string, number>>({});
let nextId = 1;
let nextVer = 1;

// html will lowercase attribute name
const lookup: Record<string, string> = {
    ':innerhtml': 'innerHTML',
}

export function startObserver(apis: Record<string, any>) {
    var container = document.documentElement || document.body;
    walkNode(container);
}

function scopedEval(context: Record<string, any>, expr: string) {
    const evaluator = Function.apply(null, [...Object.keys(context), 'expr', "return eval('expr = undefined;' + expr)"]);
    return evaluator.apply(null, [...Object.values(context), expr]);
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

function walkNode(node: Element) {
    if (node.getAttribute('xid')) {
        return;
    }
    const xid = `n${nextId++}`;
    node.setAttribute('xid', xid);
    domObserver.observe(node, { attributes: true });
    refreshNode(node);
    if (node.tagName === 'INPUT') {
        node.addEventListener('input', () => {
            notifyNodeSubscribers(xid);
        });
        var superProps = Object.getPrototypeOf(node);
        var superSet = Object.getOwnPropertyDescriptor(superProps, "value")!.set!;
        var superGet = Object.getOwnPropertyDescriptor(superProps, "value")!.get!;
        Object.defineProperty(node, "value", {
            get: function () {
                return superGet.apply(this);
            },
            set: function (t) {
                superSet.call(this, t);
                notifyNodeSubscribers(xid);
            }
        });
    }
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name.startsWith('@')) {
            node.addEventListener(attr.name.substring(1), () => {
                scopedEval({ $ }, attr.value);
            });
        }
    }
    for (let i = 0; i < node.children.length; i++) {
        walkNode(node.children[i])
    }
}

function $(selector: any) {
    const elem = document.getElementById(selector.substring(1));
    subscribeNode(elem);
    return elem;
}

function refreshNode(node: Element) {
    effect(() => {
        for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            if (attr.name.startsWith(':')) {
                setAttribute(node, attr.name, scopedEval({ $ }, attr.value));
            }
        }
    })
}

function setAttribute(node: Element, name: string, value: any) {
    if (name.startsWith(':style.')) {
        let key = lookup[name.substring(':style.'.length)];
        if (!key) {
            key = name.substring(':style.'.length);
        }
        return Reflect.set((node as HTMLElement).style, key, value);
    }
    let key = lookup[name];
    if (!key) {
        key = name.substring(1);
    }
    Reflect.set(node, key, value);
}