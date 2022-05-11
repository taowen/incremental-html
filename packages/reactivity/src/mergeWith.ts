export function mergeWith(toNode: HTMLElement, fromNode: HTMLTemplateElement) {
    mergeAttributes(toNode, fromNode);
    mergeChildNodes(toNode, fromNode.content.cloneNode(true));
}

function mergeChildNodes(toNode: HTMLElement, fromNode: { firstChild: Node | null }) {
    const oldChildren = indexOldChildren(toNode);
    let newChild = fromNode.firstChild;
    let index = 0;
    while (newChild) {
        if (newChild.nodeType !== 1) {
            continue;
        }
        const newChildEl = newChild as HTMLElement;
        const key = newChildEl.id || newChildEl.getAttribute('key') || index;
        const oldChildEl = oldChildren.get(key);
        if (oldChildEl) {
            mergeAttributes(oldChildEl, newChildEl);
        }
        index++;
        newChild = newChild.nextSibling;
    }
}

function mergeAttributes(toNode: HTMLElement, fromNode: HTMLElement) {
    for (let i = 0; i < fromNode.attributes.length; i++) {
        const attr = fromNode.attributes.item(i)!;
        toNode.setAttribute(attr.name, attr.value);
    }
}

function indexOldChildren(oldEl: HTMLElement) {
    let oldChild = oldEl.firstChild;
    let index = 0;
    const oldChildren = new Map<any, HTMLElement>();
    while (oldChild) {
        if (oldChild.nodeType !== 1) {
            continue;
        }
        const oldChildEl = oldChild as HTMLElement;
        const key = oldChildEl.id || oldChildEl.getAttribute('key')
        if (key) {
            oldChildren.set(key, oldChildEl);
        } else {
            oldChildren.set(index, oldChildEl);
        }
        index++;
        oldChild = oldChild.nextSibling;
    }
    return oldChildren;
}