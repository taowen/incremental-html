import { morphChildNodes, morphInnerHTML } from '@incremental-html/morph';
import { evalSync } from './eval';
import { camelize } from './naming';
import { elementProxy } from './subscribeNode';

morphChildNodes.morphProperties = (oldEl, newEl) => {
    // renderTemplate set $props to new element
    // if old element reused, we need to propagate $props to old element
    (oldEl as any).$props = (newEl as any).$props;
    refreshNode(oldEl);
}

export function refreshNode(node: Element) {
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name.startsWith('bind:')) {
            try {
                const newValue = evalSync(attr.value, elementProxy(node));
                setNodeProperty(node, camelize(attr.name.substring('bind:'.length)), newValue);
            } catch (e) {
                console.error(`failed to eval ${attr.name}`, { node, e });
            }
        }
    }
}

export function setNodeProperty(node: Element, name: string, value: any) {
    if (name.startsWith('style.')) {
        Reflect.set((node as HTMLElement).style, name.substring('style.'.length), value)
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