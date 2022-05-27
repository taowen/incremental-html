# jsx to html

Use jsx as server side html template

```tsx
// filename: newsletter.tsx
import { jsxToHtml } from '@incremental-html/jsx-to-html'

// server is an express router
server.get('/newsletter', async (req, resp) => {
    const html: string = await jsxToHtml(<div>hello</div>);
    resp.status(200).set({ 'Content-Type': 'text/html' }).end(html);
})
```

The `tsconfig.json` should configure like this to translate `*.tsx` using jsxToHtml

```json
{
    "compilerOptions": {
//...
        "jsx": "react",
        "jsxFactory": "jsxToHtml.createElement",
        "jsxFragmentFactory": "jsxToHtml.Fragment",
//...
}
```

## async context

We can use jsxToHtml as an alterantive to node.js `async_hooks`. 
There is no runtime trick, works in any environment (including deno, cloudflare workers, etc)

```tsx
test('component with context', async () => {
    const C1 = async (props: {}, ctx: { msg: string }) => {
        await new Promise<void>(resolve => resolve());
        return <div>{ctx.msg}</div>
    }
    const result = <context msg="hello"><C1 /></context>
    expect(await jsxToHtml(result, { msg: 'original msg' })).toBe('<div>\nhello\n</div>');
})
```

The context will be automatically passed down the tree. 
`<context>` is a built-in component to alter the context in the middle.