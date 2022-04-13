import { effect, reactive } from '@vue/reactivity';
export * from './jsxToHtml';

const nodeVersions = reactive<Record<string, number>>({});
let nextId = 1;
let nextVer = 1;

// html will lowercase attribute name
const lookup: Record<string, string> = {
    ':innerhtml': 'innerHTML',
}

const apis: Record<string, any> = {};

export function startObserver(platformApis: Record<string, any>) {
    Object.assign(apis, platformApis);
    Object.assign(apis, { $ });
    registerNode(document.documentElement || document.body);
}

function scopedEval(expr: string, extraContext?: Record<string, any>) {
    const context = { ...apis, ...extraContext };
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
        if (attr.name === '@init') {
            scopedEval(attr.value);
        } else if (attr.name.startsWith('@')) {
            node.addEventListener(attr.name.substring(1), function() {
                scopedEval(attr.value, { arguments });
            });
        }
    }
    for (let i = 0; i < node.children.length; i++) {
        registerNode(node.children[i])
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
                setAttribute(node, attr.name, scopedEval(attr.value));
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