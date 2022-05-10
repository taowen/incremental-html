import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

export const config = { indexHtml: '' }
const server = express.Router();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', async (req, resp) => {
    const jsx = <>
        <template id="tab-item">
            <li bind:class="this.$props.selected ? 'selected' : ''"
                on:click="
    document.body.tabs.forEach(tab => tab.selected = (tab.label === this.$props.label));
    ">
                <span bind:text-content="`${this.$props.icon} ${this.$props.label}`"></span>
                <div class="underline" on:render="if(!this.$props.selected) { this.parentNode.removeChild(this) }"
                    use:motion="$Motion" motion:layout-id="'underline'"></div>
            </li>
        </template>
        <template id="tab-panel">
            <div on:render="this.id = this.$props.label" bind:text-content="this.$props.icon"
                use:motion="$Motion" motion:initial="{ opacity: 0, y: 20 }" motion:animate="{ opacity: 1, y: 0 }" motion:exit="{ opacity: 0, y: -20 }"
                motion:transition="{ duration: 0.5 }"></div>
        </template>
        <div class="window">
            <nav>
                <ul bind:inner-html="document.body.tabs.map(tab => $renderTemplate('#tab-item', {...tab}))"></ul>
            </nav>
            <main>
                <div bind:inner-html="(() => {
            for (const tab of document.body.tabs) {
                if (tab.selected) {
                    return [$renderTemplate('#tab-panel', tab)];
                }
            }
        })()"></div>
            </main>
        </div>
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