/// <reference path="../../index.d.ts" />
import { CountQueuingStrategy, WritableStream } from 'node:stream/web';
import { jsxToHtml } from '..';
import { renderChild } from '../jsxToHtml';

test('string literal', async () => {
    const result = <>hello</>
    expect(await jsxToHtml(result)).toBe('hello');
})

test('string value', async () => {
    const result = <>{'hello'}</>
    expect(await jsxToHtml(result)).toBe('hello');
})

test('async string value', async () => {
    const result = <>{new Promise<string>(resolve => resolve('hello'))}</>
    expect(await jsxToHtml(result)).toBe('hello');
})

test('number value', async () => {
    const result = <>{100}</>
    expect(await jsxToHtml(result)).toBe('100');
})

test('plain element', async () => {
    const result = <div>hello</div>
    expect(await jsxToHtml(result)).toBe('<div>\nhello\n</div>');
})

test('string attribute', async () => {
    const result = <div title="hello" />
    expect(await jsxToHtml(result)).toBe('<div title="hello">\n\n</div>');
})

test('boolean attribute', async () => {
    const result = <input disabled />
    expect(await jsxToHtml(result)).toBe('<input disabled>\n\n</input>');
})

test('component without args', async () => {
    const C1 = () => {
        return <div>hello</div>
    }
    const result = <C1 />
    expect(await jsxToHtml(result)).toBe('<div>\nhello\n</div>');
})

test('component with args', async () => {
    const C1 = ({ msg }: { msg: string }) => {
        return <div>{msg}</div>
    }
    const result = <C1 msg="hello" />
    expect(await jsxToHtml(result)).toBe('<div>\nhello\n</div>');
})

test('component with children', async () => {
    const C1 = ({ children }: { children?: any }) => {
        return <div>{jsxToHtml(children)}</div>
    }
    const result = <C1>hello</C1>
    expect(await jsxToHtml(result)).toBe('<div>\nhello\n</div>');
})

test('component with context', async () => {
    const C1 = async (props: {}, ctx: { msg: string }) => {
        await new Promise<void>(resolve => resolve());
        return <div>{ctx.msg}</div>
    }
    const result = <context msg="hello"><C1 /></context>
    expect(await jsxToHtml(result, { msg: 'original msg' })).toBe('<div>\nhello\n</div>');
})

test('streaming', async () => {
    const chunks: string[] = [];
    const stream = new WritableStream({
        write(chunk) {
            chunks.push(chunk);
        }
    }, new CountQueuingStrategy({ highWaterMark: 1 }))
    const result = <div>hello</div>
    expect(await jsxToHtml(result, {}, stream)).toBe('');
    expect(chunks.join('')).toBe('<div>\nhello\n</div>');
})

test('recover from error', async () => {
    const badPromise: string = new Promise<string>((resolve, reject) => reject(new Error('wtf'))) as any;
    const ErrorBoundary = async ({ children }: { children?: any }, ctx: any) => {
        try {
            await renderChild(children, ctx)
        } catch (e) {
            await renderChild(<div>{`${e}`}</div>, ctx);
        }
        return null;
    }
    expect(await jsxToHtml(<ErrorBoundary>
        <div>before<span title={badPromise}>hello</span>after</div>
    </ErrorBoundary>)).toBe('<div>\nbefore\n<span>\n\n</span>\n</div><div>\nError: wtf\n</div>');
})