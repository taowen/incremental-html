import { createForm, decodeForm } from '@incremental-html/form-object';
import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

export const config = { indexHtml: '' }
interface NewTodoForm {
    task: string;
}

let nextId = 1;
const todoItems = [
    { id: nextId++, task: 'fix bike'},
    { id: nextId++, task: 'buy tomato' }
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
    todoItems.push({ id: nextId++, task: form.task });
    return resp.json({ data: 'ok' });
})

server.post('/delete', async (req, resp) => {
    await new Promise<void>(resolve => setTimeout(resolve, 3000));
    for (let i = 0; i < todoItems.length; i++) {
        const todoItem = todoItems[i];
        if (todoItem.id === req.body.id) {
            todoItems.splice(i, 1);
            break;
        }
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
        <ul class="flex flex-col gap-2 w-96" use:motion-config="$Motion.Config" motion-config:block-initial-animation>
            {todoItems.map(item => <TodoItem item={item} />)}
            <li id="add" class="bg-blue-200 rounded p-2" use:motion="$Motion" motion:layout>
                <form class="flex flex-row grow items-center justify-between" id="newTodo" method="post" action="/add" use:fetcher="$Fetcher" on:submit="
                    await this.fetcher.submit();
                    this.closest('ul').motionConfig.blockInitialAnimation = false;
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

function TodoItem({ item }: { item: { id: number, task: string } }) {
    return <li id={`item-${item.id}`} class="bg-blue-200 rounded p-2 flex flex-row grow items-center justify-between" 
            use:motion='$Reorder' motion:initial="{ opacity: 0, scale: 0.98 }" 
            motion:animate="{ opacity: 1, scale: 1, transition: { ease: 'easeIn' } }" 
            motion:exit="{ opacity: 0, scale: 0.98, transition: { ease: 'easeOut' } }">
        <a href={`/item?task=${encodeURIComponent(item.id)}`}
            on:click="$navigator.href = this.href;">
            {item.task}
        </a>
        <button use:fetcher="$Fetcher" prop:disabled="this.fetcher.isSubmitting" 
            prop:text-content="this.fetcher.isSubmitting ? 'deleting...' : 'x'" 
            data-item-id={item.id} on:click="
            await this.fetcher.submit('/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: Number(this.dataset.itemId) })
            });
            await $navigator.reload();"/>
    </li>
}

async function sendHtml(resp: Response, jsx: any) {
    let html = config.indexHtml;
    html = html.replace('<!--app-html-->', await jsxToHtml(jsx))
    resp.status(200).set({ 'Content-Type': 'text/html' }).end(html);
}

export default server;