export function createElement(tag: string, props: Record<string, any>, ...children: any[]) {
    return { tag, props, children }
}

export const Fragment = 'Fragment';

export async function jsxToHtml(node: any): Promise<string> {
    if (!node) {
        return '';
    }
    if (node.tag === undefined) {
        return `${node}`;
    }
    if (node.tag === Fragment) {
        const children = [];
        for (const child of node.children) {
            children.push(await jsxToHtml(child));
        }
        return children.join('\n');
    }
    if (typeof node.tag === 'string') {
        const parts = ['<', node.tag];
        if (node.props) {
            for (const [k, v] of Object.entries(node.props)) {
                parts.push(' ');
                parts.push(k);
                parts.push('="');
                parts.push(`${v}`);
                parts.push('"');
            }
        }
        parts.push('>\n');
        for (const child of node.children) {
            parts.push(await jsxToHtml(child));
        }
        parts.push('\n</', node.tag, '>');
        return parts.join('');
    }
    return await jsxToHtml(await node.tag({...node.props, children: node.children }));
}

jsxToHtml.createElement = createElement;
jsxToHtml.Fragment = Fragment;