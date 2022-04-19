import { jsxToHtml } from "@incremental-html/jsx-to-html"
import { Request, Response } from 'express';

const todoItems = [
    'fix bike',
    'buy tomato'
]

export async function POST(req: Request, resp: Response) {
    todoItems.push(req.body.todoTask);
    return JSON.stringify({ data: 'ok' });
}

export async function GET(req: Request, resp: Response) {
    return <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
            <form id="newTodo" method="post" on:submit="
                const [e] = arguments;
                await $$.submitForm(e.target);
                await $$.navigator.reload();
            ">
                <input type="text" name="todoTask" />
                <button>add todo</button>
            </form>
            <ul>
            {
                todoItems.map(todoItem => <li>{todoItem}</li>)
            }
            </ul>
        </body>
    </html>
}