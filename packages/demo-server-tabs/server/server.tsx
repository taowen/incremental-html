import { jsxToHtml } from '@incremental-html/jsx-to-html';
import express, { Response } from 'express';

export const config = { indexHtml: '' }
const server = express.Router();

server.get('/', async (req, resp) => {
    const selectedTab = req.query.tab as string || 'Tomato';
    const tabs = [{
        icon: '🍅', label: 'Tomato', selected: true
    }, {
        icon: '🥬', label: 'Lettuce'
    }, {
        icon: '🧀', label: 'Cheese'
    }];
    const jsx = <>
        <div class="window">
            <nav>
                <ul>
                    {tabs.map(({ label, icon }) =>
                        <li class={label === selectedTab ? 'selected' : ''} data-label={label} on:click="$navigator.replace('/?tab=' + this.dataset.label)">
                            <span>{icon}{label}</span>
                            {label === selectedTab ? <div class="underline" use:motion="$Motion" motion:layout-id="'underline'"></div> : undefined}
                        </li>)}
                </ul>
            </nav>
            <main>
                <div id={selectedTab}
                    use:motion="$Motion" motion:initial="{ opacity: 0, y: 20 }" motion:animate="{ opacity: 1, y: 0 }" 
                    motion:exit="{ opacity: 0, y: -20 }" motion:transition="{ duration: 0.5 }">
                    {{
                        Tomato: '🍅',
                        Lettuce: '🥬',
                        Cheese: '🧀'
                    }[selectedTab]}
                </div>
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