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