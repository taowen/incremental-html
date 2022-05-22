import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

export const config = { indexHtml: '' }
const server = express.Router();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', async (req, resp) => {
    await sendHtml(resp, <header>
        <h1>HTML5 Example Page</h1>
    </header>)
})

async function sendHtml(resp: Response, jsx: any) {
    let html = config.indexHtml;
    html = html.replace('<!--app-html-->', await jsxToHtml(jsx))
    resp.end(html);
}

export default server;