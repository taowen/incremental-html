import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

export const config = { indexHtml: '' }

const server = express.Router();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.get('/', async (req, resp) => {
    await sendHtml(resp, <Layout>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Veritatis
        laudantium rerum ab facilis dicta fugit, cum repellendus. Eius tempore
        laudantium, explicabo enim necessitatibus, consequatur quasi, doloribus
        rerum cum similique veritatis.
    </Layout>);
});

server.get('/page1', async (req, resp) => {
    await sendHtml(resp, <Layout>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Veritatis
        laudantium rerum ab facilis dicta fugit, cum repellendus. Eius tempore
        laudantium, explicabo enim necessitatibus, consequatur quasi, doloribus
        rerum cum similique veritatis.
    </Layout>);
});

server.get('/page2', async (req, resp) => {
    await sendHtml(resp, <Layout>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur
        tempora voluptate dolores natus dolor vel, impedit est iusto eaque
        quisquam delectus quas quaerat repellendus ipsam animi porro sint iste
        quos? Lorem ipsum, dolor sit amet consectetur adipisicing elit.
        Perferendis similique odit non? In officia repellendus quo possimus
        repudiandae dolor est laborum, hic, natus nulla quis commodi asperiores
        pariatur iste. Architecto.
    </Layout>);
});

function Layout({ children }: { children?: any }) {
    return <div>
        <nav class="flex flex-row justify-center gap-4 m-4">
            <Link href="/page1" label="page 1" />
            <Link href="/page2" label="page 2" />
        </nav>
        <main class="flex flex-row justify-center">
            <p class="w-72" use-cloak use:motion="$Motion" 
                motion:initial="{ opacity: 0, x: 100 }"
                motion:animate="{ opacity: 1, x: 0 }"
                motion:exit="{ opacity: 0, x: -100 }"
                motion:transition="{ duration: 0.5 }">
                {children}
            </p>
        </main>
    </div>
}

function Link({ href, label }: { href: string, label: string }) {
    return <a class="bg-blue-400 rounded px-4 py-1" href={href} on:click="
        await document.body.motionConfig.exit();
        window.location.href = this.href;
    ">{label}</a>;
}

async function sendHtml(resp: Response, jsx: any) {
    let html = config.indexHtml;
    html = html.replace('<!--app-html-->', await jsxToHtml(jsx))
    // no-store prevent browser back-button to reuse old cached page
    // because exit animation will leave the page in a invisible state
    resp.status(200).set({ 'Content-Type': 'text/html', 'Cache-Control': 'no-store' }).end(html);
}

export default server;