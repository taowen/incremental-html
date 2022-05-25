import { morph } from "./morph";
import { morphAttributes } from "./morphAttributes";

export async function morphChildNodes(oldEl: Element, newEl: Element | Node[]) {
    morph(oldEl, () => {
        removeIncompatibleChildNodes(oldEl, newEl);
        commitNewChildNodes(oldEl);
    });
}

/**
 * SPI: will be called before node removed from old element
 * @param el the node to be removed
 */
morphChildNodes.beforeRemove = (el: Element): Promise<void> | void => { };
/**
 * SPI: will be called when a old element being reused
 * @param oldEl the old element
 * @param newEl the new element
 */
morphChildNodes.morphProperties = (oldEl: Element, newEl: Element) => { };

function commitNewChildNodes(el: Element) {
    const removeProgress = (el as any).$removeProgress;
    if (removeProgress) {
        const removeProgressPromise = Promise.all(removeProgress);
        delete (el as any).$removeProgress;
        removeProgressPromise.finally(() => {
            commitNewChildNodes(el);
        });
        return;
    }
    const newChildren = (el as any).$newChildNodes;
    if (newChildren !== undefined) {
        delete (el as any).$newChildNodes;
    }
    moveOrInsertNewChildren(el, newChildren);
    if (newChildren !== undefined) {
        for (const child of newChildren) {
            commitNewChildNodes(child);
        }
    } else {
        let child = el.firstChild;
        while (child) {
            if (child.nodeType === 1) {
                commitNewChildNodes(child as Element);
            }
            child = child.nextSibling;
        }
    }
}

function moveOrInsertNewChildren(el: Element, newChildren: Node[] | undefined) {
    if (!newChildren) {
        return;
    }
    let oldNode = el.lastChild;
    for (let i = newChildren.length - 1; i >= 0; i--) {
        const next = newChildren[i + 1]!;
        const newNode = newChildren[i]!;
        if (oldNode === newNode) {
            // keep old node in original place to avoid losing scroll position
            oldNode = oldNode.previousSibling;
        } else {
            el.insertBefore(newNode, next as Node);
        }
        if ((newNode as any).$reused) {
            morphAttributes(newNode as Element, (newNode as any).$reused);
            morphChildNodes.morphProperties(newNode as Element, (newNode as any).$reused);
            delete (newNode as any).$reused;
        }
    }
}

function removeIncompatibleChildNodes(oldEl: Element, newEl: Element | Node[]) {
    const oldChildren = indexOldChildren(oldEl);
    const mergedResult = []; // some node will be old, some node will be new
    const removeProgress: Promise<void>[] = [];
    // build the new nodes
    if (Array.isArray(newEl)) {
        const newChildNodes: Node[] = [];
        flatternArray(newChildNodes, newEl);
        for (let index = 0; index < newChildNodes.length; index++) {
            const newChild = newChildNodes[index];
            if ((newChild as Element).id) {
                mergedResult.push(tryReuse(oldChildren, (newChild as Element).id, newChild));
            } else {
                mergedResult.push(tryReuse(oldChildren, index, newChild));
            }
        }
    } else {
        let newChild = newEl.firstChild;
        let index = 0;
        while (newChild) {
            if ((newChild as Element).id) {
                mergedResult.push(tryReuse(oldChildren, (newChild as Element).id, newChild));
            } else {
                mergedResult.push(tryReuse(oldChildren, index, newChild));
            }
            index++;
            newChild = newChild.nextSibling;
        }
    }
    (oldEl as any).$newChildNodes = mergedResult;
    // remove old extra nodes not in new nodes
    for (const oldChild of oldChildren.values()) {
        if (oldChild.nodeType === 1) {
            const promise = morphChildNodes.beforeRemove(oldChild as Element);
            if (promise) {
                removeProgress.push(promise.finally(() => {
                    try {
                        oldEl.removeChild(oldChild)
                    } catch (e) {
                        // ignore
                    }
                }));
            } else {
                oldEl.removeChild(oldChild);
            }
        } else {
            oldEl.removeChild(oldChild);
        }
    }
    if (removeProgress.length > 0) {
        (oldEl as any).$removeProgress = removeProgress;
    }
}

function tryReuse(oldChildren: Map<any, Node>, id: any, newNode: Node) {
    const oldNode = oldChildren.get(id);
    if (newNode.nodeType === 3 && oldNode?.nodeType === 3) {
        oldChildren.delete(id);
        oldNode.nodeValue = newNode.nodeValue;
        return oldNode;
    }
    if (newNode.nodeType !== 1 || !oldNode || oldNode.nodeType !== newNode.nodeType
        || (oldNode as HTMLElement).tagName !== (newNode as HTMLElement).tagName) {
        return newNode;
    }
    oldChildren.delete(id);
    (oldNode as any).$reused = newNode;
    // for feature like List, it will manage its children by itself
    if (oldNode.dispatchEvent(new Event('shouldMorph', { cancelable: true }))) {
        if ((oldNode as HTMLElement).tagName !== 'TEXTAREA') {
            removeIncompatibleChildNodes(oldNode as Element, newNode as Element);
        }
    }
    return oldNode;
}

function indexOldChildren(oldEl: Element) {
    let oldChild = oldEl.firstChild;
    let index = 0;
    const oldChildren = new Map<any, Node>();
    while (oldChild) {
        if ((oldChild as Element).id) {
            oldChildren.set((oldChild as Element).id, oldChild);
        } else {
            oldChildren.set(index, oldChild);
        }
        index++;
        oldChild = oldChild.nextSibling;
    }
    return oldChildren;
}

function flatternArray(flatterned: Node[], childNodes: any) {
    if (Array.isArray(childNodes)) {
        for (const childNode of childNodes) {
            flatternArray(flatterned, childNode);
        }
    } else {
        flatterned.push(childNodes);
    }
}
