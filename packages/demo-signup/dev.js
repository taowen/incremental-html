const express = require('express');
const { createServer: createViteServer} = require('vite');

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
    server.use('/favicon.ico', async (req, res) => {
        res.status(404).end();
    });
    server.use('*', async (req, res) => {
        try {
            console.log(req.method, req.originalUrl);
            const handlers = await vite.ssrLoadModule(req.originalUrl === '/' ? './src/server/index.tsx' : `./src/server${req.originalUrl}.tsx`);
            if (!handlers[req.method]) {
                throw new Error(`missing handler of ${req.method}`);
            }
            const result = await handlers[req.method]();
            res.status(200).set({ 'Content-Type': 'text/html' }).end(result);
        } catch (e) {
            vite && vite.ssrFixStacktrace(e)
            console.log(e.stack)
            res.status(500).end(e.stack)
        }
    })
    server.listen(3000, () => {
        console.log('http://localhost:3000')
    });
}

main();