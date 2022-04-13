import { effect, reactive } from '@vue/reactivity';

var domObserver = new MutationObserver(function (mutation) {
    console.log()
});

const nodesTracker = reactive({});
let nextId = 1;

// html will lowercase attribute name
const lookup: Record<string, string> = {
    ':innerhtml': 'innerHTML',
    ':style': 'style',
    'color': 'color'
}

export function startObserver(apis: Record<string, any>) {
    var container = document.documentElement || document.body;
    walkNode(container);
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
            Reflect.set(nodesTracker, xid, nextId++);
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
                Reflect.set(nodesTracker, xid, nextId++);
            }
        });
    }
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name.startsWith('@')) {
            node.addEventListener(attr.name.substring(1), () => {
                eval(attr.value);
            });
        }
    }
    for (let i = 0; i < node.children.length; i++) {
        walkNode(node.children[i])
    }
}

function $(selector: any) {
    const elem = document.getElementById(selector.substring(1));
    if (elem) {
        const xid = elem.getAttribute('xid');
        if (xid) {
            Reflect.get(nodesTracker, xid);
        }
    }
    return elem;
}

function refreshNode(node: Element) {
    effect(() => {
        for (let i = 0; i < node.attributes.length; i++) {
            const attr = node.attributes[i];
            if (attr.name.startsWith(':')) {
                setAttribute(node, attr.name, eval(attr.value));
            }
        }
    })
}

function setAttribute(node: Element, name: string, value: any) {
    if (name.startsWith(':style.')) {
        const key = lookup[name.substring(':style.'.length)];
        if (!key) {
            throw new Error('lookup not defined for: ' + name);
        }
        return Reflect.set((node as HTMLElement).style, key, value);
    }
    const key = lookup[name];
    if (!key) {
        throw new Error('lookup not defined for: ' + name);
    }
    Reflect.set(node, key, value);
}