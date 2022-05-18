export const Fragment = 'Fragment';

export function createElement(tag: string, props: Record<string, any>, ...children: any[]) {
    const element = (ctx: any) => renderElement(ctx, tag, props, children);
    element.IS_ELEMENT = true;
    return element;
}

async function renderElement(ctx: any, tag: string, props: Record<string, any>, children: any[]) {
    if (tag === Fragment) {
        return await renderChild(ctx, children);
    }
    if (tag === 'context') {
        return await renderChild({...ctx, ...props}, children);
    }
    if (typeof tag === 'string') {
        const parts = ['<', tag];
        if (props) {
            for (const [k, v] of Object.entries(props)) {
                if (typeof v === 'boolean') {
                    if (v) {
                        parts.push(' ');
                        parts.push(k);
                    }
                } else {
                    parts.push(' ');
                    parts.push(k);
                    parts.push('="');
                    parts.push(`${v}`);
                    parts.push('"');
                }
            }
        }
        parts.push('>\n');
        parts.push(await renderChild(ctx, children));
        parts.push('\n</', tag, '>');
        return parts.join('');
    }
    return await (tag as Function)({ ...props, children }, ctx)
}

async function renderChild(ctx: any, node: any): Promise<string> {
    if (!node) {
        return '';
    }
    if (typeof node === 'string') {
        return node;
    }
    if (node.IS_ELEMENT) {
        return await renderChild(ctx, await (node as any)(ctx));
    }
    if (Array.isArray(node)) {
        const children = [];
        for (const child of node) {
            children.push(await renderChild(ctx, child));
        }
        return children.join('\n');
    }
    return `${node}`;
}

export function createContext() {
    return {
        createElement,
        Fragment
    }
}

export function jsxToHtml(element: JSX.Element, ctx?: any) {
    return renderChild(ctx || {}, element)
}

jsxToHtml.createContext = createContext;
jsxToHtml.createElement = createElement;
jsxToHtml.Fragment = Fragment;