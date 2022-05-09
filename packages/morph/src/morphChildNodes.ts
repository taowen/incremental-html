import { morph } from "./morph";
import { morphAttributes } from "./morphAttributes";

export function morphChildNodes(oldEl: Element, newEl: Element | Node[]) {
    morph(oldEl, () => {
        _morphChildNodes(oldEl, newEl);
    })
}

function _morphChildNodes(oldEl: Element, newEl: Element | Node[]) {
    const oldChildren = indexOldChildren(oldEl);
    const newChildren = [];
    // build the new nodes
    if (Array.isArray(newEl)) {
        for (let index = 0; index < newEl.length; index++) {
            const newChild = newEl[index];
            if ((newChild as Element).id) {
                newChildren.push(tryReuse(oldChildren.get((newChild as Element).id), newChild));
            } else {
                newChildren.push(tryReuse(oldChildren.get(index), newChild));
            }
        }
    } else {
        let newChild = newEl.firstChild;
        let index = 0;
        while (newChild) {
            if ((newChild as Element).id) {
                newChildren.push(tryReuse(oldChildren.get((newChild as Element).id), newChild));
            } else {
                newChildren.push(tryReuse(oldChildren.get(index), newChild));
            }
            index++;
            newChild = newChild.nextSibling;
        }
    }
    // move new nodes to its place
    for (let i = newChildren.length - 1; i >= 0; i--) {
        const next = newChildren[i+1];
        oldEl.insertBefore(newChildren[i]!, next as Node);
    }
    // remove old extra nodes not in new nodes
    let oldChild = newChildren.length === 0 ? oldEl.lastChild : newChildren[0]!.previousSibling;
    while (oldChild) {
        const toRemove = oldChild;
        oldChild = oldChild.previousSibling;
        if((toRemove as any).$beforeRemove) {
            (async () => {
                await (toRemove as any).$beforeRemove();
                try {
                    oldEl.removeChild(toRemove);
                } catch(e) {
                    // parent might has been removed as well
                }
            })();
        } else {
            oldEl.removeChild(toRemove);
        }
    }
}

morphChildNodes.morphProperties = (oldEl: Element, newEl: Element) => {};

function tryReuse(oldNode: Node | undefined, newNode: Node) {
    if (newNode.nodeType !== 1) {
        return newNode;
    }
    if (!oldNode) {
        return newNode;
    }
    if (oldNode.nodeType !== newNode.nodeType) {
        return newNode;
    }
    if ((oldNode as HTMLElement).tagName !== (newNode as HTMLElement).tagName) {
        return newNode;
    }
    morphAttributes(oldNode as Element, newNode as Element);
    if ((oldNode as HTMLElement).tagName !== 'TEXTAREA') {
        morphChildNodes(oldNode as Element, newNode as Element);
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