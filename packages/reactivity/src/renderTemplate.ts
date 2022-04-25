import { morphChildNodes } from './morphChildNodes';

morphChildNodes.morphProperties = (oldEl, newEl) => {
    // renderTemplate set $props to new element
    // if old element reused, we need to propagate $props to old element
    (oldEl as any).$props = (newEl as any).$props;
}

export function renderTemplate(selector: string, props?: Record<string, any>) {
    const templateNode: HTMLTemplateElement = document.querySelector(selector)!;
    if (!templateNode) {
        throw new Error(`template ${selector} not found`);
    }
    const content = templateNode.content.cloneNode(true);
    const rendered = [];
    for (let i = 0; i < content.childNodes.length; i++) {
        const child = content.childNodes[i];
        if (child.nodeType !== 1) {
            continue;
        }
        setProps(child, props || {});
        rendered.push(child);
    }
    if (rendered.length === 1) {
        return rendered[0]
    }
    const div = document.createElement('div');
    for (const child of rendered) {
        div.appendChild(child);
    }
    return div;
}

function setProps(node: Node, props: Record<string, any>) {
    if (node.nodeType !== 1) {
        return;
    }
    (node as any).$props = props;
    for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        setProps(child, props);
    }
}