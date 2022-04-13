export function createElement(tag: string, props: Record<string, any>, ...children: any[]) {
    return { tag, props, children }
}

export class Fragment {
}

export default function toHtml(node: any) {
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
    parts.push('>');
    for (const child of node.children) {
        if (child.tag) {
            parts.push(toHtml(child));
        } else {
            parts.push(`${child}`);
        }
    }
    parts.push('</', node.tag, '>');
    return parts.join('');
}

toHtml.createElement = createElement;
toHtml.Fragment = Fragment;