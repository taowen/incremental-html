import { reactive } from '@vue/reactivity';

const nodeVersions = reactive<Record<string, number>>({});
let nextVer = 1;

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