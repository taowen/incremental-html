/// <reference path="../../index.d.ts" />
import { jsxToHtml } from '..';

test('string literal', async () => {
    const result = <>hello</>
    expect(await jsxToHtml(result)).toBe('hello');
})

test('string value', async () => {
    const result = <>{'hello'}</>
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
    const C1 = ({ msg }: { msg: string}) => {
        return <div>{msg}</div>
    }
    const result = <C1 msg="hello"/>
    expect(await jsxToHtml(result)).toBe('<div>\nhello\n</div>');
})

test('component with context', async () => {
    const C1 = async (props: {}, ctx: { msg: string}) => {
        await new Promise<void>(resolve => resolve());
        return <div>{ctx.msg}</div>
    }
    const result = <context msg="hello"><C1/></context>
    expect(await jsxToHtml(result)).toBe('<div>\nhello\n</div>');
})