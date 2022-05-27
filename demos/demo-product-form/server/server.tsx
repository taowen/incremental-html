import { createForm, decodeForm, NewForm } from '@incremental-html/form-object';
import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

export const config = { indexHtml: '' }
interface ProductForm {
    name: string;
    description: string;
    hasVariants: boolean;
    price: number;
    inventory: number;
    variants: {
        id: string
        variantType?: string;
        price?: number;
        inventory?: number;
    }[]
}

/**
 * PageState should be minimal to only include client input
 * so we do not include the whole ProductForm here
 */
interface PageState {
    hasVariants: boolean,
    variants: {
        id: string
    }[]
}

const server = express.Router();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

let theProduct = {} as ProductForm;

server.post('/save', async (req, resp) => {
    const form = decodeForm<ProductForm>(req.body);
    if (form.sendErrors(resp, 'validation failed')) {
        return;
    }
    theProduct = JSON.parse(JSON.stringify(form));
    return resp.json({ data: 'ok' });
})

// load the initial form
server.get('/', async (req, resp) => {
    // fill form with persisted "theProduct"
    // so the client can begin editing with what has been saved last time
    const form = createForm(theProduct);
    // to make the size smaller
    const pageState: PageState = {
        hasVariants: !!theProduct.hasVariants,
        variants: (theProduct.variants || []).map(v => { return { id: v.id } })
    }
    await sendHtml(resp, <ProductFormPage form={form} />, pageState);
});

// grow form dynamically with user input
server.put('/', async (req, resp) => {
    // as form editing state is held in client side
    // we do not need load "theProduct" here
    // the form generated will be blank without values
    // it will be merged into client editing state by reloader.reload()
    const form = createForm(req.body as ProductForm);
    const pageState = req.body;
    await sendHtml(resp, <ProductFormPage form={form} />, pageState);
})

async function ProductFormPage({ form }: { form: NewForm<ProductForm> }) {
    return <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Product Form</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
            <form method="post" action="/save" use:fetcher="$Fetcher" on:submit="await this.fetcher.submit();">
                <fieldset style="display: flex; flex-direction: column;">
                    <div>
                        <label for={form.idOf('name')}>name</label>
                        <input {...form.idAndNameOf('name')} type="text" value={form.name || ''} />
                    </div>
                    <div>
                        <label for={form.idOf('description')}>description</label>
                        <textarea {...form.idAndNameOf('description')}>{form.description || ''}</textarea>
                    </div>
                    <div>
                        <label for={form.idOf('hasVariants')}>hasVariant</label>
                        <input {...form.idAndNameOf('hasVariants')} type="checkbox" checked={!!form.hasVariants} on:input="
                        document.body.reloader.pageState.hasVariants = this.checked;
                        document.body.reloader.reload();
                        "/>
                    </div>
                    {
                        form.hasVariants ? <VariantsForm form={form} /> : <NoVariantForm form={form} />
                    }
                </fieldset>
                <div><button>save</button></div>
            </form>
        </body>
    </html>;
}

async function VariantsForm({ form }: { form: NewForm<ProductForm> }) {
    return <>
        {
            (form.variants || []).map(variant => <div id={variant.id}>

                <input {...variant.idAndNameOf('id')} type="hidden" value={variant.id} />

                <label for={variant.idOf('variantType')}>variant type</label>
                <input {...variant.idAndNameOf('variantType')} type="text" value={variant.variantType || ''} />

                <label for={variant.idOf('inventory')}>inventory</label>
                <input {...variant.idAndNameOf('inventory')} type="text" value={variant.inventory || ''} />

                <label for={variant.idOf('price')}>price</label>
                <input {...variant.idAndNameOf('price')} type="text" value={variant.price || ''} />

                <button on:click="
                const thisVariantId = this.closest('div').id;
                const variants = document.body.reloader.pageState.variants;
                for (let i = 0; i < variants.length; i++) {
                    if (variants[i].id === thisVariantId) {
                        variants.splice(i, 1);
                        break;
                    }
                }
                document.body.reloader.reload();
                ">x</button>
            </div>)
        }
        <div><button on:click="
        const pageState = document.body.reloader.pageState;
        pageState.variants.push({ id: `variant-${new Date().getTime()}` });
        document.body.reloader.reload();
        ">+</button></div>
    </>
}

async function NoVariantForm({ form }: { form: NewForm<ProductForm> }) {
    return <>
        <div>
            <label for={form.idOf('price')}>price</label>
            <input {...form.idAndNameOf('price')} type="text" value={form.price || ''} />
        </div>
        <div>
            <label for={form.idOf('inventory')}>inventory</label>
            <input {...form.idAndNameOf('inventory')} type="text" value={form.inventory || ''} />
        </div>
    </>
}

/**
 * send html response to client with optional page state
 * @param resp express response object
 * @param jsx jsx element
 * @param pageState if provided, HTTP PUT of the same url need to handled to accept client updated pageState
 */
async function sendHtml(resp: Response, jsx: any, pageState?: any) {
    let html = config.indexHtml;
    html = html.replace('<!--app-html-->', await jsxToHtml(jsx))
    const toInject = [];
    if (pageState) {
        toInject.push(`<template class="page-state">${JSON.stringify(pageState)}</template>`);
    }
    html = html.replace('</body>', toInject.join('\n') + '</body>');
    resp.status(200).set({ 'Content-Type': 'text/html' }).end(html);
}

export default server;