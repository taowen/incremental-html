import { morphChildNodes, morphInnerHTML } from '@incremental-html/morph';
import { callEventHandlerSync, evalExpr } from './eval';
import { camelize } from './naming';

export function setNodeProperty(node: Element, name: string, value: any) {
    if (name.startsWith('style.')) {
        Reflect.set((node as HTMLElement).style, name.substring('style.'.length), value)
        return;
    }
    if (name === 'class') {
        node.className = value;
        return;
    }
    if (name.startsWith('class.')) {
        value = ' ' + value;
        const oldClass = Reflect.get(node, name);
        Reflect.set(node, name, value);
        if (oldClass) {
            node.className = node.className.replace(oldClass, '') + value;
        } else {
            node.className = node.className + value;
        }
        return;
    }
    if (name === 'innerHtml') {
        morphInnerHTML(node, value);
        return;
    }
    if (name === 'childNodes') {
        morphChildNodes(node, Array.isArray(value) ? value : [value]);
        return;
    }
    Reflect.set(node, name, value);
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
        renderNode(rendered[0] as Element);
        return rendered[0]
    }
    const div = document.createElement('div');
    for (const child of rendered) {
        div.appendChild(child);
    }
    renderNode(div);
    return div;
}

function renderNode(node: Element) {
    if (node.hasAttribute('render:if')) {
        const shouldRender = evalExpr(node.getAttribute('render:if')!, node);
        if (!shouldRender) {
            node.parentElement?.removeChild(node);
        }
        node.removeAttribute('render:if');
    }
    if (node.hasAttribute('on:render')) {
        callEventHandlerSync(node, 'render');
        node.removeAttribute('on:render');
    }
    const toRemove = [];
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name.startsWith('render:')) {
            toRemove.push(attr.name);
            const propName = camelize(attr.name.substring('render:'.length));
            let value = undefined;
            try {
                value = evalExpr(attr.value, node);
            } catch (e) {
                console.error(`failed to eval ${attr.name} of `, node, e);
                continue;
            }
            setNodeProperty(node, propName, value);
        }
    }
    for (const attr of toRemove) {
        node.removeAttribute(attr);
    }
    for (let i = 0; i < node.children.length; i++) {
        renderNode(node.children[i])
    }
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