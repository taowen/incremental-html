import { createForm, decodeForm } from '@incremental-html/form-object';
import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

export const config = { indexHtml: '' }
interface NewTodoForm {
    task: string;
}

let nextId = 1;
let todoItems = [
    { id: nextId++, task: 'fix bike' },
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

server.post('/reorder', async(req,resp) => {
    todoItems = req.body;
    return resp.json({ data: 'ok' });
})

server.post('/delete', async (req, resp) => {
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
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
    const jsx = <>
    <div class="m-4">
        <ul class="flex flex-col gap-2 w-96" use:motion-config="$Motion.Config" motion-config:block-initial-animation>
            {todoItems.map(item => <TodoItem item={item} />)}
            <li id="add" class="bg-blue-200 rounded p-2" use:motion="$Motion" motion:layout>
                <form class="flex flex-row grow items-center justify-between" id="newTodo" method="post" action="/add" use:fetcher="$Fetcher" on:submit="
                    document.querySelector('#success-toast').toast.show({ content: 'hello' });
                    await this.fetcher.submit();
                    this.closest('ul').motionConfig.blockInitialAnimation = false;
                    await $navigator.reload();
                    this.reset();
                ">
                    <input class="min-h-full p-1 rounded border border-blue-800" type="text" name={form.nameOf('task')} />
                    <button class="bg-blue-800 text-white rounded p-1 w-16" prop:disabled="this.closest('form').fetcher.isSubmitting">
                        <svg display:inline="this.closest('form').fetcher.isSubmitting" class="animate-spin h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span display:inline="!this.closest('form').fetcher.isSubmitting">Add</span>
                    </button>
                </form>
            </li>
        </ul>
    </div>
    <div class="absolute bottom-8 right-8 flex flex-col gap-2 items-end">
        <template id="success-toast" use:toast="$Toast" toast:duration="3000">
            <div class="rounded bg-red-300 px-3 py-1" prop:text-content="this.$props.content" 
            use:motion="$Motion" motion:layout
            motion:initial="{ opacity: 0, y: 50, scale: 0.3 }"
            motion:animate="{ opacity: 1, y: 0, scale: 1 }"
            motion:exit="{ opacity: 0, y: 20, scale: 0.5 }"/>
        </template>
    </div>
    </>;
    await sendHtml(resp, jsx);
});

function TodoItem({ item }: { item: { id: number, task: string } }) {
    return <li id={`item-${item.id}`} data-item={JSON.stringify(item)} class="bg-blue-200 rounded p-2 flex flex-row grow items-center justify-between"
        use:motion='$Reorder' motion:initial="{ opacity: 0, scale: 0.98 }"
        motion:animate="{ opacity: 1, scale: 1, transition: { ease: 'easeIn' } }"
        motion:exit="{ opacity: 0, scale: 0.98, transition: { ease: 'easeOut' } }"
        motion:on-drag-end="async (...args) => {
            const items = [...document.querySelectorAll('[data-item]')].map(li => JSON.parse(li.dataset.item));
            await fetch('/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(items)
            });
        }">
        <a href={`/item?task=${encodeURIComponent(item.id)}`}
            on:click="$navigator.href = this.href;">
            {item.task}
        </a>
        <button use:fetcher="$Fetcher" prop:disabled="this.fetcher.isSubmitting"
            data-item-id={item.id} on:click="
            await this.fetcher.submit('/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: this.closest('li').dataset.item
            });
            await $navigator.reload();">
            <svg display:inline="this.parentNode.fetcher.isSubmitting" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg display:inline="!this.parentNode.fetcher.isSubmitting" class="h-5 w-5 text-red-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">
                <path stroke="currentColor" fill="currentColor" d="M34.2,30l13.5-13.4c.6-.6,.9-1.4,.9-2.2s-.4-1.5-.9-2c-1.3-1.1-3.2-1.1-4.2,0l-13.5,13.4-13.4-13.5c-.6-.6-1.4-.9-2.2-.9s-1.5,.4-2,.9c-.5,.6-.8,1.3-.8,2.1,0,.9,.3,1.6,.9,2.1l13.3,13.5-13.5,13.4c-.6,.6-.9,1.4-.9,2.2s.4,1.5,.9,2c.6,.5,1.3,.8,2.1,.8s1.6-.3,2.1-.9l13.5-13.3,13.4,13.5c.6,.6,1.3,.9,2.1,.9h.1c.8,0,1.5-.4,2-.9,1.1-1.2,1.1-3.1,.1-4.2l-13.5-13.5Z"></path>
            </svg>
        </button>
    </li>
}

async function sendHtml(resp: Response, jsx: any) {
    let html = config.indexHtml;
    html = html.replace('<!--app-html-->', await jsxToHtml(jsx))
    resp.status(200).set({ 'Content-Type': 'text/html' }).end(html);
}

export default server;