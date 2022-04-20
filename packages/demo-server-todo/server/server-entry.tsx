import { createForm } from '@incremental-html/form-object';
import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';

interface NewTodoForm {
    task: string;
}

const todoItems = [
    'fix bike',
    'buy tomato'
]

const server = express();
server.use(bodyParser.urlencoded({ extended: true }))

server.post('/add', async (req, resp) => {
    todoItems.push(req.body.todoTask);
    return resp.json({ data: 'ok' });
})

server.get('/', async (req, resp) => {
    const form = createForm({} as NewTodoForm);
    const jsx = <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
            <form id="newTodo" method="post" action="/add" on:submit="
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
    </html>;
    await sendJsx(resp, jsx);
});

async function sendJsx(resp: Response, jsx: any) {
    let result = await jsxToHtml(jsx);
    if (result) {
        result = "<!DOCTYPE html>" + result;
    }
    if (result) {
        result = result.replace('</body>', '<script type="module" src="./client/client-entry.js"></script></body>');
    }
    resp.status(200).set({ 'Content-Type': 'text/html' }).end(result);
}

export default async function (req: Request, resp: Response) {
    return await server(req, resp);
}