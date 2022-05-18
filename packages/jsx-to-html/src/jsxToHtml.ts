export const Fragment = 'Fragment';

export function createElement(tag: string, props: Record<string, any>, ...children: any[]) {
    const element = (ctx: any) => renderElement(ctx, tag, props, children);
    element.IS_ELEMENT = true;
    return element;
}

export type transformFn = (props: { tag: string, props: Record<string, any>, children: any[] }) => { tag: string, props: Record<string, any>, children: any[] } | undefined;

async function renderElement(ctx: {
    transform?: transformFn,
    __writer: WritableStreamDefaultWriter,
    [key: string]: any
}, tag: string, props: Record<string, any>, children: any[]) {
    if (ctx.transform) {
        const transformed = ctx.transform({ tag, props, children });
        if (transformed) {
            tag = transformed.tag;
            props = transformed.props;
            children = transformed.children;
        }
    }
    if (tag === Fragment) {
        return await renderChild(ctx, children);
    }
    if (tag === 'context') {
        return await renderChild({ ...ctx, ...props }, children);
    }
    const { __writer } = ctx;
    if (typeof tag === 'string') {
        __writer.write('<');
        __writer.write(tag);
        if (props) {
            for (const [k, v] of Object.entries(props)) {
                if (typeof v === 'boolean') {
                    if (v) {
                        __writer.write(' ');
                        __writer.write(k);
                    }
                } else {
                    __writer.write(' ');
                    __writer.write(k);
                    __writer.write('="');
                    __writer.write(`${v}`);
                    __writer.write('"');
                }
            }
        }
        __writer.write('>\n');
        await renderChild(ctx, children);
        __writer.write('\n</');
        __writer.write(tag);
        __writer.write('>');
        return;
    }
    return await (tag as Function)({ ...props, children }, ctx)
}

async function renderChild(ctx: { __writer: WritableStreamDefaultWriter, [key: string]: any }, node: any): Promise<void> {
    node = await node;
    if (!node) {
        return;
    }
    const { __writer } = ctx;
    if (typeof node === 'string') {
        __writer.write(node);
        return;
    }
    if (node.IS_ELEMENT) {
        return await renderChild(ctx, await (node as any)(ctx));
    }
    if (Array.isArray(node)) {
        for (const [i, child] of node.entries()) {
            if (i !== 0) {
                __writer.write('\n');
            }
            await renderChild(ctx, child);
        }
        return;
    }
    __writer.write(`${node}`);
    return;
}

export async function jsxToHtml(element: JSX.Element, ctx?: {
    transform?: transformFn,
    [key: string]: any
}, stream?: WritableStream): Promise<string> {
    if (stream) {
        const writer = stream.getWriter();
        try {
            await renderChild({ ...ctx, __writer: writer }, element)
            return '';
        } finally {
            await writer.close();
        }
    } else {
        const chunks: string[] = [];
        await renderChild({
            ...ctx, __writer: {
                write: (chunk: string) => { chunks.push(chunk) }
            } as any
        }, element)
        return chunks.join('');
    }
}
jsxToHtml.createElement = createElement;
jsxToHtml.Fragment = Fragment;