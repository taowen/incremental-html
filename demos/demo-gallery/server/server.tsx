import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';

export const config = { indexHtml: '' }
const server = express.Router();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

const favImages = new Set<number>();

server.post('/unfav', async (req, resp) => {
    favImages.delete(req.body.imageId);
    resp.end('ok');
})

server.post('/fav', async (req, resp) => {
    favImages.add(req.body.imageId);
    resp.end('ok');
})

server.get('/', async (req, resp) => {
    if (req.query.from) {
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
    }
    const tab = req.query.tab as string || 'columns1'
    await sendHtml(resp, <main class="flex flex-col h-screen">
        <div class="grow-0 shrink-0 basis-auto border-b border-gray-200 dark:border-gray-700">
            <ul class="flex h-12 -mb-px text-sm font-medium gap-2" role="tablist">
                <Tab tab={tab} controls="columns1" label="1 Column" />
                <Tab tab={tab} controls="columns2" label="2 Columns" />
                <Tab tab={tab} controls="columns3" label="3 Columns" />
                <div class="grow"></div>
                <div class="inline-flex items-center mr-4 align-center">#Fav {favImages.size}</div>
            </ul>
        </div>
        {tab === 'columns1' ? <div id="columns1" class="flex-1 overflow-y-auto" use:list="$List" list:masonry-column-class="ml-4">
            <GalleryImages query={req.query} />
        </div> : undefined}
        {tab === 'columns2' ? <div id="columns2" class="flex-1 overflow-y-auto" use:list="$List" list:masonry-column-class="ml-4" list:masonry-columns="2">
            <GalleryImages query={req.query} />
        </div> : undefined}
        {tab === 'columns3' ? <div id="columns3" class="flex-1 overflow-y-auto" use:list="$List" list:masonry-column-class="ml-4" list:masonry-columns="3">
            <GalleryImages query={req.query} />
        </div> : undefined}
    </main>)
})

function GalleryImages({ query }: { query: Request['query'] }) {
    const from = Number(query.from || 0)
    const count = Number(query.count || 5)
    const images = range(from, from + count).filter(imageId => imageId < 20);
    const loadMore = <div use:loader="$List.Loader" class="ml-8" 
        loader:url={'/?' + new URLSearchParams({ ...query as any, from: images[images.length - 1], count: from === 0 ? count + 1 : count })} >
            <div display:block="$closestFeature(this, $List.Loader).isLoading">Loading...</div>
            <div prop:loader="$closestFeature(this, $List.Loader)" display:block="this.loader.loadError" on:click="this.loader.load()">Load failed, click to retry</div>
        </div>;
    return <>
        {images.map(imageId => <GalleryImage imageId={imageId} reloadUrl={'/?' + new URLSearchParams({ ...query as any, from: imageId, count: 1 })} />)}
        {images.length > 1 ? loadMore : <div use:loader="$List.Loader" class="ml-8">Reached end</div>}
    </>
}

function GalleryImage({ imageId, reloadUrl }: { imageId: number, reloadUrl: string }) {
    return <div id={`image-${imageId}`} class="relative">
        <img class="pt-4" src={`/images/${imageId}.jpg`} />
        {favImages.has(imageId)
            ? <div class="absolute left-1 bottom-1 text-black"
                use:reloader="$List.Reloader" reloader:url={reloadUrl}
                data-image-id={imageId} on:click="
                    await fetch('/unfav', { body: JSON.stringify({ imageId: Number(this.dataset.imageId) }), method: 'POST', 
                        headers: { 'Content-Type': 'application/json' } });
                    $closestFeature(this, $List.Reloader).reload();
                    document.body.reloader.reload();">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 fill-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </div>
            : <div class="absolute left-1 bottom-1 mix-blend-difference text-white hover:mix-blend-normal hover:text-black"
                use:reloader="$List.Reloader" reloader:url={reloadUrl}
                data-image-id={imageId} on:click="
                    await fetch('/fav', { body: JSON.stringify({ imageId: Number(this.dataset.imageId) }), method: 'POST', 
                        headers: { 'Content-Type': 'application/json' } });
                    $closestFeature(this, $List.Reloader).reload();
                    document.body.reloader.reload();">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 fill-tranparent hover:fill-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </div>}
    </div>
}

function range(from: number, to: number) {
    const result = [];
    for (let i = from; i < to; i++) {
        result.push(i);
    }
    return result;
}

function Tab({ tab, controls, label }: { tab?: string, controls: string, label: string }) {
    if (tab === controls) {
        return <li role="presentation">
            <button class="inline-flex items-center pl-4 pr-4 h-full rounded-t-lg border-b-2 border-blue-600"
                type="button" role="tab" aria-controls={controls} aria-selected="true"
                on:click={`document.body.reloader.reload('/?tab=${controls}')`}>{label}</button>
        </li>
    } else {
        return <li role="presentation">
            <button class="inline-flex items-center pl-4 pr-4 h-full rounded-t-lg border-b-2 border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300"
                type="button" role="tab" aria-controls={controls} aria-selected="false"
                on:click={`document.body.reloader.reload('/?tab=${controls}')`}>{label}</button>
        </li>
    }
}

async function sendHtml(resp: Response, jsx: any) {
    let html = config.indexHtml;
    html = html.replace('<!--app-html-->', await jsxToHtml(jsx))
    resp.end(html);
}

export default server;