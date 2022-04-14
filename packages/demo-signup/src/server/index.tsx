import { jsxToHtml } from 'incremental-html';
import { Request, Response } from 'express';

export async function POST(req: Request, resp: Response) {
}

export async function GET(req: Request, resp: Response) {
    return await jsxToHtml(<html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body oninit="console.log('hello')">
            <Comp1 />
        </body>
    </html>)
}

async function Comp1() {
    await new Promise(resolve => setTimeout(resolve, 0));
    return <>hello</>
}