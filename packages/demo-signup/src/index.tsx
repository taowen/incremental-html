import { jsxToHtml } from 'incremental-html';

export async function render() {
    return await jsxToHtml(<html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body on:init="console.log('hello')">
            <Comp1 />
        </body>
    </html>)
}

export async function Comp1() {
    await new Promise(resolve => setTimeout(resolve, 0));
    return <>hello</>
}