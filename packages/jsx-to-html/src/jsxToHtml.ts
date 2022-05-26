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
        return await renderChild(children, ctx);
    }
    if (tag === 'context') {
        return await renderChild(children, { ...ctx, ...props });
    }
    const { __writer } = ctx;
    if (typeof tag === 'string') {
        __writer.write('<');
        __writer.write(tag);
        try {
            if (props) {
                for (let [k, v] of Object.entries(props)) {
                    v = await v;
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
        } catch(e) {
            __writer.write('>\n');
            __writer.write('\n</');
            __writer.write(tag);
            __writer.write('>');
            throw e;
        }
        __writer.write('>\n');
        try {
            await renderChild(children, ctx);
        } finally {
            __writer.write('\n</');
            __writer.write(tag);
            __writer.write('>');
        }
        return;
    }
    return await (tag as Function)({ ...props, children }, ctx)
}

export async function renderChild(node: any, ctx: { __writer: WritableStreamDefaultWriter, [key: string]: any }): Promise<void> {
    node = await node;
    if (node === null || node === undefined) {
        return;
    }
    const { __writer } = ctx;
    if (typeof node === 'string') {
        __writer.write(node);
        return;
    }
    if (node.IS_ELEMENT) {
        return await renderChild(await (node as any)(ctx), ctx);
    }
    if (Array.isArray(node)) {
        for (const [i, child] of node.entries()) {
            if (i !== 0) {
                __writer.write('\n');
            }
            await renderChild(child, ctx);
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
            await renderChild(element, { ...ctx, __writer: writer })
            return '';
        } finally {
            await writer.close();
        }
    } else {
        const chunks: string[] = [];
        await renderChild(element, {
            ...ctx, __writer: {
                write: (chunk: string) => { chunks.push(chunk) }
            } as any
        })
        return chunks.join('');
    }
}
jsxToHtml.createElement = createElement;
jsxToHtml.Fragment = Fragment;