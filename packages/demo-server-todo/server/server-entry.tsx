import { createForm, decodeForm } from '@incremental-html/form-object';
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
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.post('/add', async (req, resp) => {
    const form = decodeForm<NewTodoForm>(req.body);
    if (!form.task) {
        form.setError('task', 'task is required');
    }
    if (form.sendErrors(resp, 'validation failed')) {
        return;
    }
    todoItems.push(form.task);
    return resp.json({ data: 'ok' });
})

server.post('/delete', async(req, resp) => {
    const index = todoItems.indexOf(req.body.task);
    if (index !== -1) {
        todoItems.splice(index, 1);
    }
    return resp.json({ data: 'ok' });
})

server.get('/item', async(req, resp) => {
    resp.write('<html>');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const jsx = <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>{req.query.task}</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
            <h2>Todo</h2>
            <p>{req.query.task}</p>
        </body>
    </html>;
    await sendHtml(resp, jsx);
})

server.get('/', async (req, resp) => {
    const form = createForm({} as NewTodoForm);
    const jsx = <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Manage Todos</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
            <form id="newTodo" method="post" action="/add" on:submit="
            await $$.submitForm(this);
            await $$.navigator.reload();
            this.reset();
        ">
                <input type="text" name={form.nameOf('task')} />
                <button>add todo</button>
            </form>
            <ul>
                {
                    todoItems.map(todoItem => <li>
                        <a href={`/item?task=${encodeURIComponent(todoItem)}`}
                        on:click="
                            const [e] = arguments;
                            e.preventDefault();
                            $$.navigator.href = this.href;
                        "
                        >{todoItem}</a>
                        <button on:click={`
                            await fetch('/delete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ task: '${todoItem}' })
                            });
                            await $$.navigator.reload();
                    `}>x</button></li>)
                }
            </ul>
        </body>
    </html>;
    await sendHtml(resp, jsx);
});

async function sendHtml(resp: Response, jsx: any) {
    let result = await jsx;
    if (result) {
        result = "<!DOCTYPE html>" + result;
    }
    if (result) {
        result = result.replace('</body>', '<script type="module" src="./client/client-entry.js"></script></body>');
    }
    if (!resp.statusCode) {
        resp.status(200).set({ 'Content-Type': 'text/html' })
    }
    resp.end(result);
}

export default async function (req: Request, resp: Response) {
    return await server(req, resp);
}