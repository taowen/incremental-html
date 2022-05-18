import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import * as newsletter from './pages/newsletter';
import * as indexPage from './pages/[...all]';

const server = express();
server.use(bodyParser.urlencoded({ extended: false }))

server.post('/newsletter', async (req, resp) => {
    await newsletter.POST(req, resp);
});

server.get('/newsletter', async (req, resp) => {
    await sendHtml(resp, await newsletter.GET());
})

server.get('/', async (req, resp) => {
    await sendHtml(resp, await indexPage.GET(req, resp));
});

async function sendHtml(resp: Response, jsx: any) {
    if (!jsx) {
        return;
    }
    const html = await jsxToHtml(jsx, {
        transform({ tag, props, children }) {
            if (tag === 'body') {
                return { tag, props, children: [...children, '<script type="module" src="./client/client-entry.js"></script>']}
            }
            return undefined;
        }
    });
    resp.status(200).contentType('html');
    resp.write('<!DOCTYPE html>');
    resp.end(html);
}

export default async function (req: Request, resp: Response) {
    return await server(req, resp);
}