import { effect, reactive } from '@vue/reactivity';

const nodeVersions = reactive<Record<string, number>>({});
let nextId = 1;
let nextVer = 1;

// html will lowercase attribute name
const lookup: Record<string, string> = {
    '_innerhtml': 'innerHTML',
}

export function startObserver() {
    (window as any).$ = $;
    registerNode(document.documentElement || document.body);
}

const evaluator = Function.apply(null, ['expr', "return eval('expr = undefined;' + expr)"]);
function scopedEval(expr: string) {
    return evaluator.apply(null, [expr]);
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
        if (attr.name === 'oninit') {
            scopedEval(attr.value);
        }
    }
    for (let i = 0; i < node.children.length; i++) {
        registerNode(node.children[i])
    }
}

function $(selector: any) {
    if (selector[0] !== '#') {
        throw new Error('not implemented');
    }
    const elem = document.getElementById(selector.substring(1));
    subscribeNode(elem);
    return elem;
}

function refreshNode(node: Element) {
    effect(() => {
        for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            if (attr.name.startsWith('_')) {
                setAttribute(node, attr.name, scopedEval(attr.value));
            }
        }
    })
}

function setAttribute(node: Element, name: string, value: any) {
    if (name.startsWith('_style.')) {
        let key = lookup[name.substring('_style.'.length)];
        if (!key) {
            key = name.substring('_style.'.length);
        }
        return Reflect.set((node as HTMLElement).style, key, value);
    }
    let key = lookup[name];
    if (!key) {
        key = name.substring('_'.length);
    }
    Reflect.set(node, key, value);
}