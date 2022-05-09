import { morph, morphChildNodes, morphInnerHTML } from '@incremental-html/morph';
import { callEventHandler, evalSync } from './eval';
import { camelize } from './naming';

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
            const name = camelize(attr.name.substring('bind:'.length));
            try {
                const newValue = evalSync(attr.value, node);
                let bindProps = (node as any).$bindProps;
                if (!bindProps) {
                    (node as any).$bindProps = bindProps = {};
                }
                bindProps[name] = newValue;
            } catch (e) {
                console.error(`failed to eval ${attr.name}`, { node, e });
            }
        }
    }
    if ((node as any).$bindProps) {
        applyBindProps(node);
    }
}

async function applyBindProps(node: Element) {
    await new Promise<void>(resolve => resolve());
    const bindProps = (node as any).$bindProps;
    if (!bindProps) {
        return;
    }
    delete (node as any).$bindProps;
    const { innerHtml, childNodes, ...otherBindProps } = bindProps;
    if (Object.keys(otherBindProps).length > 0) {
        morph(node, () => {
            for (const [name, value] of Object.entries(otherBindProps)) {
                setNodeProperty(node, name, value);
            }
        });
    }
    if (innerHtml) {
        morphInnerHTML(node, innerHtml);
    }
    if (childNodes) {
        morphChildNodes(node, Array.isArray(childNodes) ? childNodes : [childNodes]);
    }
}

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
    if (node.hasAttribute('on:render')) {
        callEventHandler('render', node, node.getAttribute('on:render')!);
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