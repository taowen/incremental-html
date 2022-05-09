import { morphAttributes } from "./morphAttributes";

export async function morphChildNodes(oldEl: Element, newEl: Element | Node[]) {
    oldEl.dispatchEvent(new Event('beforeMorph'));
    const removeProgress: Promise<void>[] = [];
    try {
        removeIncompatibleChildNodes(removeProgress, oldEl, newEl);
    } finally {
        if (removeProgress.length === 0) {
            commitNewChildNodes(oldEl);
            oldEl.dispatchEvent(new Event('afterMorph'));
            return;
        } else {
            oldEl.dispatchEvent(new Event('afterMorph'));
        }
    }
    await Promise.all(removeProgress);
    oldEl.dispatchEvent(new Event('beforeMorph'));
    commitNewChildNodes(oldEl);
    oldEl.dispatchEvent(new Event('afterMorph'));
}

function commitNewChildNodes(el: Element) {
    const newChildren = (el as any).$newChildNodes;
    if (newChildren !== undefined) {
        for (let i = newChildren.length - 1; i >= 0; i--) {
            const next = newChildren[i + 1];
            el.insertBefore(newChildren[i]!, next as Node);
        }
        delete (el as any).$newChildNodes;
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

function removeIncompatibleChildNodes(removeProgress: Promise<void>[], oldEl: Element, newEl: Element | Node[]) {
    const oldChildren = indexOldChildren(oldEl);
    const newChildren = [];
    // build the new nodes
    if (Array.isArray(newEl)) {
        for (let index = 0; index < newEl.length; index++) {
            const newChild = newEl[index];
            if ((newChild as Element).id) {
                newChildren.push(tryReuse(removeProgress, oldChildren, (newChild as Element).id, newChild));
            } else {
                newChildren.push(tryReuse(removeProgress, oldChildren, index, newChild));
            }
        }
    } else {
        let newChild = newEl.firstChild;
        let index = 0;
        while (newChild) {
            if ((newChild as Element).id) {
                newChildren.push(tryReuse(removeProgress, oldChildren, (newChild as Element).id, newChild));
            } else {
                newChildren.push(tryReuse(removeProgress, oldChildren, index, newChild));
            }
            index++;
            newChild = newChild.nextSibling;
        }
    }
    (oldEl as any).$newChildNodes = newChildren;
    // remove old extra nodes not in new nodes
    for (const oldChild of oldChildren.values()) {
        if (oldChild.nodeType === 1) {
            const promise = morphChildNodes.beforeRemove(oldChild as Element);
            if (promise) {
                removeProgress.push(promise.finally(() => oldEl.removeChild(oldChild)));
            } else {
                oldEl.removeChild(oldChild);
            }
        } else {
            oldEl.removeChild(oldChild);
        }
    }
}

morphChildNodes.beforeRemove = (el: Element): Promise<void> | void => { };
morphChildNodes.morphProperties = (oldEl: Element, newEl: Element) => { };

function tryReuse(removeProgress: Promise<void>[], oldChildren: Map<any, Node>, id: any, newNode: Node) {
    const oldNode = oldChildren.get(id);
    if (newNode.nodeType !== 1 || !oldNode || oldNode.nodeType !== newNode.nodeType
        || (oldNode as HTMLElement).tagName !== (newNode as HTMLElement).tagName) {
        return newNode;
    }
    oldChildren.delete(id);
    morphAttributes(oldNode as Element, newNode as Element);
    if ((oldNode as HTMLElement).tagName !== 'TEXTAREA') {
        removeIncompatibleChildNodes(removeProgress, oldNode as Element, newNode as Element);
    }
    morphChildNodes.morphProperties(oldNode as Element, newNode as Element);
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