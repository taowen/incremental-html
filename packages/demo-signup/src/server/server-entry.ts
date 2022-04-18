import { Request, Response } from 'express';
import { jsxToHtml } from '@incremental-html/jsx-to-html';
import * as indexPage from './pages/[...all]'
import * as newsletter from './pages/newsletter'

export default async function (req: Request, resp: Response) {
    let matched = undefined as any;
    if (req.originalUrl.startsWith('/newsletter')) {
        matched = newsletter;
    } else {
        matched = indexPage;
    }
    const methodHandler = matched[req.method];
    if (!methodHandler) {
        resp.status(404).end('missing handler for method: ' + req.method);
        return '';
    }
    const result = await jsxToHtml(await methodHandler(req, resp));
    if (result) {
        return "<!DOCTYPE html>" + result;
    }
    return result;
}