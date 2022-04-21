export const Fragment = 'Fragment';

export async function createElement(tag: string, props: Record<string, any>, ...children: any[]) {
    if (tag === Fragment) {
        return await processChild(children);
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
        parts.push(await processChild(children));
        parts.push('\n</', tag, '>');
        return parts.join('');
    }
    return await (tag as Function)({...props, children })
}

async function processChild(node: any): Promise<string> {
    node = await node;
    if (!node) {
        return '';
    }
    if (typeof node === 'string') {
        return node;
    }
    if (Array.isArray(node)) {
        const children = [];
        for (const child of node) {
            children.push(await processChild(child));
        }
        return children.join('\n');
    }
    return `${node}`;
}

export const jsxToHtml = {
    createElement,
    Fragment
}