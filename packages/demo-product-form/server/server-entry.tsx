import { createForm, decodeForm, NewForm } from '@incremental-html/form-object';
import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Request, Response } from 'express';

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

interface PageState {
    hasVariants: boolean,
    nextId: number,
    variantIds: string[]
}

const server = express();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.post('/add', async (req, resp) => {
    const form = decodeForm<ProductForm>(req.body);
    console.log('submit form', form);
    if (form.sendErrors(resp, 'validation failed')) {
        return;
    }
    return resp.json({ data: 'ok' });
})

server.put('/', async (req, resp) => {
    await sendHtml(resp, <ProductFormPage {...req.body} />);
})

server.get('/', async (req, resp) => {
    await sendHtml(resp, <ProductFormPage hasVariants={false} variantIds={[]} nextId={1} />);
});

async function ProductFormPage(pageState: PageState) {
    const variants = pageState.variantIds.map(id => { return { id }});
    const form = createForm({ variants } as ProductForm);
    const jsx = <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Product Form</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
            <form method="post" action="/add" on:submit="
                await $$.submitForm(this);
            ">
                <fieldset style="display: flex; flex-direction: column;">
                    <div>
                        <label for={form.idOf('name')}>name</label>
                        <input {...form.idAndNameOf('name')} type="text" />
                    </div>
                    <div>
                        <label for={form.idOf('description')}>description</label>
                        <input {...form.idAndNameOf('description')} type="text" />
                    </div>
                    <div>
                        <label for={form.idOf('hasVariants')}>hasVariant</label>
                        <input {...form.idAndNameOf('hasVariants')} type="checkbox" checked={pageState.hasVariants} on:input="
                        $$.navigator.pageState.hasVariants = this.checked;
                        $$.navigator.reload();
                        "/>
                    </div>
                    {
                        pageState.hasVariants ? <VariantsForm form={form} /> : <NoVariantForm form={form} />
                    }
                </fieldset>
                <div><button>save</button></div>
            </form>
            <template class="page-state">
                {JSON.stringify(pageState)}
            </template>
        </body>
    </html>;
    return jsx;
}

async function VariantsForm({ form }: { form: NewForm<ProductForm> }) {
    return <>
        {
            form.variants.map(variant => <div id={variant.id}>

                <label for={variant.idOf('variantType')}>variant type</label>
                <input {...variant.idAndNameOf('variantType')} type="text" />

                <label for={variant.idOf('inventory')}>inventory</label>
                <input {...variant.idAndNameOf('inventory')} type="text" />

                <label for={variant.idOf('price')}>price</label>
                <input {...variant.idAndNameOf('price')} type="text" />

                <button on:click="
                const variantIds = $$.navigator.pageState.variantIds;
                const index = variantIds.indexOf(this.closest('div').id);
                if (index !== -1) {
                    variantIds.splice(index, 1);
                }
                $$.navigator.reload();
                ">x</button>
            </div>)
        }
        <div><button on:click="
        const pageState = $$.navigator.pageState;
        pageState.variantIds.push(`variant-${pageState.nextId++}`);
        $$.navigator.reload();
        ">+</button></div>
    </>
}

async function NoVariantForm({ form }: { form: NewForm<ProductForm> }) {
    return <>
        <div>
            <label for={form.idOf('price')}>price</label>
            <input {...form.idAndNameOf('price')} type="text" />
        </div>
        <div>
            <label for={form.idOf('inventory')}>inventory</label>
            <input {...form.idAndNameOf('inventory')} type="text" />
        </div>
    </>
}

async function sendHtml(resp: Response, jsx: any) {
    let result = await jsx;
    if (result) {
        result = "<!DOCTYPE html>" + result;
    }
    if (result) {
        result = result.replace('</body>', '<script type="module" src="./client/client-entry.js"></script></body>');
    }
    if (!resp.statusCode) {
        resp.status(200).set({ 'Content-Type': 'text/html' })
    }
    resp.end(result);
}

export default async function (req: Request, resp: Response) {
    return await server(req, resp);
}