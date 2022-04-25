import { morphChildNodes } from './morphChildNodes';

export function morphInnerHTML(node: Element, value: string) {
    if (typeof value === 'string') {
        const newNode = document.createElement('div');
        newNode.innerHTML = value;
        morphChildNodes(node, newNode);
    } else {
        morphChildNodes(node, value);
    }
}