import { createForm, decodeForm } from '@incremental-html/form-object';
import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';

interface ProductForm {
    name: string;
    description: string;
}

const todoItems = [
    'fix bike',
    'buy tomato'
]

const server = express();
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.post('/add', async (req, resp) => {
    const form = decodeForm<ProductForm>(req.body);
    if (form.sendErrors(resp, 'validation failed')) {
        return;
    }
    return resp.json({ data: 'ok' });
})

server.get('/', async (req, resp) => {
    const form = createForm({} as ProductForm);
    const jsx = <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Product Form</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
            <form id="newTodo" method="post" action="/add" on:submit="
            await $$.submitForm(this);
            await $$.navigator.reload();
            this.reset();
        ">
                <label for="name">name</label>
                <input type="text" name={form.nameOf('name')} />
                <div>
                <button>save</button>
                </div>
            </form>
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