import { getMorphingProgress, morph } from "./morph";
import { morphChildNodes } from "./morphChildNodes";

export function removeChildNodes(parent: Element, childNodes: Node[]) {
    morph(parent, () => {
        const promises = [];
        for (const childNode of childNodes) {
            if (childNode.nodeType === 1) {
                const promise = morphChildNodes.beforeRemove(childNode as Element);
                if (promise) {
                    promises.push(promise);
                }
            }
        }
        const doRemove = () => {
            for (const childNode of childNodes) {
                try {
                    parent.removeChild(childNode);
                } catch (e) {
                    // ignore;
                }
            }
        }
        if (promises.length === 0) {
            doRemove();
            return;
        }
        getMorphingProgress()?.push(Promise.all(promises).finally(doRemove));
    })
}