import { evalExpr } from "./eval";

export function render(selector: string | HTMLTemplateElement, props?: Record<string, any>): Node[] {
    const template = getTemplate(selector);
    if (!template) {
        throw new Error(`template ${selector} not found`);
    }
    const rendered: Node[] = [];
    const fakeParentNode = {
        removeChild(node: Node) {
            if (rendered[rendered.length - 1] !== node) {
                throw new Error('unexpected');
            }
            rendered.length -= 1;
        }
    };
    let child = template.content.firstChild;
    while(child) {
        rendered.push(child);
        renderNode(fakeParentNode, child, props);
        child = child.nextSibling;
    }
    return rendered;
}

function renderNode(parentNode: { removeChild(node: Node): void }, node: Node, props?: Record<string, any>) {
    if (node.nodeType !== 1) {
        return;
    }
    const element = node as HTMLElement;
    const renderIf = element.getAttribute('render:if');
    if (renderIf && !evalExpr(renderIf, node)) {
        parentNode.removeChild(node);
        return;
    }
    let child = element.firstChild;
    while(child) {
        renderNode(element, child, props);
        child = child.nextSibling;
    }
}

function getTemplate(selector: string | HTMLTemplateElement) {
    if (typeof selector === 'string') {
        return document.querySelector(selector) as HTMLTemplateElement;
    }
    return selector;
}