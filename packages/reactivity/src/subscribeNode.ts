import { reactive } from '@vue/reactivity';

const nodeVersions = reactive<Record<string, number>>({});
let nextVer = 1;
const rawElement = Symbol();

export function querySelector(selector: any) {
    const elem = document.querySelector(selector);
    if (!elem) {
        return undefined;
    }
    subscribeNode(elem);
    return elementProxy(elem);
}

export function toRawElement(target: Element) {
    return (target as any)[rawElement] || target;
}

export function elementProxy(target: Element): any {
    return new Proxy(target, {
        get(target, p, receiver) {
            if (p === rawElement) {
                return target;
            }
            const v = (target as any)[p];
            if (typeof v === 'function') {
                return (...args: any[]) => {
                    const ret = v.apply(target, args);
                    if (ret?.nodeType === 1) {
                        subscribeNode(ret);
                    }
                    return ret;
                }
            }
            return v;
        }
    })
}

export function subscribeNode(node?: Element | null) {
    if (!node) {
        return;
    }
    const xid = (node as any).$xid;
    if (xid) {
        nodeVersions[xid]; // read from reactive object to subscribe
    }
}

export function notifyNodeSubscribers(xid: string) {
    nodeVersions[xid] = nextVer++;
}