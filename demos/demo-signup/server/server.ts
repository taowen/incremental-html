import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';
import * as newsletter from './pages/newsletter';
import * as indexPage from './pages/[...all]';

export const config = { indexHtml: '' }
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
    let html = config.indexHtml;
    html = html.replace('<!--app-html-->', await jsxToHtml(jsx))
    resp.status(200).contentType('html').end(html);
}

export default server;