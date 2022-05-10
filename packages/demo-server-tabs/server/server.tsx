import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

export const config = { indexHtml: '' }
const server = express.Router();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', async (req, resp) => {
    const jsx = <>
        <header>
            <h1>HTML5 Example Page</h1>
        </header>
        <main></main>
    </>
    await sendHtml(resp, jsx);
})

async function sendHtml(resp: Response, jsx: any) {
    const markerPos = config.indexHtml.indexOf('<!--app-html-->');
    if (markerPos === -1) {
        throw new Error('maker not found, can not inject server generated content');
    }
    resp.write(config.indexHtml.substring(0, markerPos));
    resp.write(await jsx);
    resp.write(config.indexHtml.substring(markerPos));
    resp.end();
}

export default server;