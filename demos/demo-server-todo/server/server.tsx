import { createForm, decodeForm } from '@incremental-html/form-object';
import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

export const config = { indexHtml: '' }
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

server.post('/delete', async (req, resp) => {
    await new Promise<void>(resolve => setTimeout(resolve, 3000));
    const index = todoItems.indexOf(req.body.task);
    if (index !== -1) {
        todoItems.splice(index, 1);
    }
    return resp.json({ data: 'ok' });
})

server.get('/item', async (req, resp) => {
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
    const jsx = <div class="m-4">
        <ul class="flex flex-col gap-2 w-96">
            {todoItems.map(task => <TodoItem task={task} />)}
            <li class="bg-blue-200 rounded p-2">
                <form class="flex flex-row grow items-center justify-between" id="newTodo" method="post" action="/add" use:fetcher="$Fetcher" on:submit="
                    await this.fetcher.submit();
                    await $navigator.reload();
                    this.reset();
                ">
                <input class="min-h-full p-1 rounded border border-blue-800" type="text" name={form.nameOf('task')} />
                <button class="bg-blue-800 text-white rounded p-1 w-16">Add</button>
            </form>
            </li>
        </ul>
    </div>;
    await sendHtml(resp, jsx);
});

function TodoItem({ task }: { task: string }) {
    return <li class="bg-blue-200 rounded p-2 flex flex-row grow items-center justify-between">
        <a href={`/item?task=${encodeURIComponent(task)}`}
            on:click="$navigator.href = this.href;">
            {task}
        </a>
        <button use:fetcher="$Fetcher" on:click={`
        await this.fetcher.submit('/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task: '${task}' })
        });
        await $navigator.reload();
        `}>x</button>
    </li>
}

async function sendHtml(resp: Response, jsx: any) {
    let html = config.indexHtml;
    html = html.replace('<!--app-html-->', await jsxToHtml(jsx))
    resp.status(200).set({ 'Content-Type': 'text/html' }).end(html);
}

export default server;