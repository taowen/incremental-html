export function copyFrom(toNode: Element, fromNode: HTMLTemplateElement) {
    copyAttributes(toNode, fromNode);
    copyChildNodes(toNode, fromNode.content.cloneNode(true));
}

function copyChildNodes(toNode: Element, fromNode: { firstChild: Node | null }) {
    const oldChildren = indexOldChildren(toNode);
    let newChild = fromNode.firstChild;
    let index = 0;
    while (newChild) {
        if (newChild.nodeType !== 1) {
            newChild = newChild.nextSibling;
            continue;
        }
        const newChildEl = newChild as Element;
        const key = newChildEl.getAttribute('key') || index;
        const oldChildEl = oldChildren.get(key);
        if (oldChildEl) {
            copyAttributes(oldChildEl, newChildEl);
            copyChildNodes(oldChildEl, newChildEl);
        } else {
            toNode.appendChild(newChild);
        }
        index++;
        newChild = newChild.nextSibling;
    }
}

function copyAttributes(toNode: Element, fromNode: Element) {
    for (let i = 0; i < fromNode.attributes.length; i++) {
        const attr = fromNode.attributes.item(i)!;
        if (attr.name === 'id') {
            continue;
        }
        toNode.setAttribute(attr.name, attr.value);
    }
}

function indexOldChildren(oldEl: Element) {
    let oldChild = oldEl.firstChild;
    let index = 0;
    const oldChildren = new Map<any, Element>();
    while (oldChild) {
        if (oldChild.nodeType !== 1) {
            oldChild = oldChild.nextSibling;
            continue;
        }
        const oldChildEl = oldChild as Element;
        const key = oldChildEl.getAttribute('key')
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