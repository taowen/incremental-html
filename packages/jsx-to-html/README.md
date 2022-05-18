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