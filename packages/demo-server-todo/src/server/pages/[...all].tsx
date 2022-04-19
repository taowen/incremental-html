import { jsxToHtml } from "@incremental-html/jsx-to-html"

export async function GET() {
    const todoItems = [
        'fix bike',
        'buy tomato'
    ]
    return <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
            <ul>
            {
                todoItems.map(todoItem => <li>{todoItem}</li>)
            }
            </ul>
        </body>
    </html>
}