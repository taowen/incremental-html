const express = require('express');
const { createServer: createViteServer } = require('vite');

const root = process.cwd();
async function main() {
    const server = express()
    const vite = await createViteServer({
        root,
        server: {
            middlewareMode: 'ssr',
            watch: {
                // During tests we edit the files too fast and sometimes chokidar
                // misses change events, so enforce polling for consistency
                usePolling: true,
                interval: 100
            }
        }
    })
    server.use(vite.middlewares);
    server.use('*', async (req, resp) => {
        try {
            req.url = req.originalUrl;
            console.log(req.method, req.url);
            const { default: handle } = await vite.ssrLoadModule('./server/server-entry.ts');
            await handle(req, resp);
        } catch (e) {
            vite && vite.ssrFixStacktrace(e)
            console.error(e.stack)
            if (!resp.statusCode) {
                resp.status(500).end(e.stack)
            }
        }
    })
    server.listen(3000, () => {
        console.log('http://localhost:3000')
    });
}

main();