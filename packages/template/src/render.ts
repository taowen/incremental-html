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
    if (renderIf) {
        if (evalExpr(renderIf, node)) {
            element.removeAttribute('render:if');            
        } else {
            parentNode.removeChild(node);
            return;
        }
    }
    const toRemove = [];
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
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
            setNodeProperty(element, propName, value);
        }
    }
    for (const attr of toRemove) {
        element.removeAttribute(attr);
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

const cacheStringFunction = <T extends (str: string) => string>(fn: T): T => {
    const cache: Record<string, string> = Object.create(null)
    return ((str: string) => {
        const hit = cache[str]
        return hit || (cache[str] = fn(str))
    }) as any
}

const camelizeRE = /-(\w)/g
const camelize = cacheStringFunction((str: string): string => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''))
})

function setNodeProperty(node: HTMLElement, name: string, value: any) {
    if (name.startsWith('style.')) {
        Reflect.set(node.style, name.substring('style.'.length), value)
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
        appendChildNodes(node, value);
        return;
    }
    if (name === 'childNodes') {
        appendChildNodes(node, value);
        return;
    }
    Reflect.set(node, name, value);
}

function appendChildNodes(element: HTMLElement, childNodes: Node[]) {
    for (const childNode of childNodes) {
        element.appendChild(childNode);
    }
}
