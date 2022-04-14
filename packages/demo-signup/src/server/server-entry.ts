/// <reference types="vite-plugin-pages/client" />
/// <reference types="incremental-html/jsx" />
import { Request, Response } from 'express';
import { jsxToHtml } from 'incremental-html';
import { createMemoryHistory, createRouter } from 'vue-router';
import routes from '~pages';

export default async function (req: Request, resp: Response) {
    const router = createRouter({
        history: createMemoryHistory(),
        routes
    });
    const route = router.resolve(req.originalUrl);
    const comp = route.matched[0]?.components?.default;
    if (!comp) {
        resp.status(404).end('page not found: ' + req.originalUrl);
        return '';
    }
    const page = await comp();
    const methodHandler = page[req.method];
    if (!methodHandler) {
        resp.status(404).end('missing handler for method: ' + req.method);
        return '';
    }
    return "<!DOCTYPE html>" + await jsxToHtml(await methodHandler(req, resp));
}