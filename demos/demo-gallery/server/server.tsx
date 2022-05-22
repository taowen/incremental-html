import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

export const config = { indexHtml: '' }
const server = express.Router();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', async (req, resp) => {
    await sendHtml(resp, <main class="flex flex-col h-screen">
        <div class="grow-0 shrink-0 basis-auto border-b border-gray-200 dark:border-gray-700">
            <ul class="flex h-12 -mb-px text-sm font-medium gap-2" role="tablist">
                <Tab selected controls="columns1" label="1 Column" />
                <Tab controls="columns2" label="2 Columns" />
                <Tab controls="columns3" label="3 Columns" />
                <div class="grow"></div>
                <div class="inline-flex items-center mr-4 align-center">#Fav 0</div>
            </ul>
        </div>
        <div class="flex-1 overflow-y-auto">
            <img class="m-4" src="/images/1.jpg"/>
            <img class="m-4" src="/images/2.jpg"/>
            <img class="m-4" src="/images/3.jpg"/>
            <img class="m-4" src="/images/4.jpg"/>
            <img class="m-4" src="/images/5.jpg"/>
            <img class="m-4" src="/images/6.jpg"/>
            <img class="m-4" src="/images/7.jpg"/>
            <img class="m-4" src="/images/8.jpg"/>
        </div>
    </main>)
})

function Tab({ selected, controls, label }: { selected?: boolean, controls: string, label: string }) {
    if (selected) {
        return <li role="presentation">
            <button class="inline-flex items-center pl-4 pr-4 h-full rounded-t-lg border-b-2 border-blue-600"
                type="button" role="tab" aria-controls={controls} aria-selected="true">{label}</button>
        </li>
    } else {
        return <li role="presentation">
            <button class="inline-flex items-center pl-4 pr-4 h-full rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                type="button" role="tab" aria-controls={controls} aria-selected="false">{label}</button>
        </li>
    }
}

async function sendHtml(resp: Response, jsx: any) {
    let html = config.indexHtml;
    html = html.replace('<!--app-html-->', await jsxToHtml(jsx))
    resp.end(html);
}

export default server;