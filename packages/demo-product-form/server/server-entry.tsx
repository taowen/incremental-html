import { createForm, decodeForm, NewForm } from '@incremental-html/form-object';
import { jsxToHtml } from '@incremental-html/jsx-to-html';
import bodyParser from 'body-parser';
import express, { Response } from 'express';

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
    variantIds: string[]
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

server.put('/', async (req, resp) => {
    await sendHtml(resp, <ProductFormPage {...req.body} />);
})

server.get('/', async (req, resp) => {
    await sendHtml(resp, <ProductFormPage hasVariants={theProduct.hasVariants} 
        variantIds={(theProduct.variants || []).map(v => v.id)} />);
});

function getOrCreateVariant(product: ProductForm, variantId: string) {
    for (const variant of product.variants || []) {
        if (variant.id === variantId) {
            return variant;
        }
    }
    return { id: variantId }
}

async function ProductFormPage(pageState: PageState) {
    const variants = pageState.variantIds.map(id => getOrCreateVariant(theProduct, id));
    const form = createForm({ ...theProduct, hasVariants: pageState.hasVariants, variants } as ProductForm);
    const jsx = <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Product Form</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
            {/* opt-in page state feature of navigator.reload() */}
            <template class="page-state">
                {JSON.stringify(pageState)}
            </template>
            <form method="post" action="/save" on:submit="
                await $$.submitForm(this);
            ">
                <fieldset style="display: flex; flex-direction: column;">
                    <div>
                        <label for={form.idOf('name')}>name</label>
                        <input {...form.idAndNameOf('name')} type="text" value={form.name || ''} />
                    </div>
                    <div>
                        <label for={form.idOf('description')}>description</label>
                        <input {...form.idAndNameOf('description')} type="text" value={form.description || ''}/>
                    </div>
                    <div>
                        <label for={form.idOf('hasVariants')}>hasVariant</label>
                        <input {...form.idAndNameOf('hasVariants')} type="checkbox" checked={!!form.hasVariants} on:input="
                        $$.navigator.pageState.hasVariants = this.checked;
                        $$.navigator.reload();
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
    return jsx;
}

async function VariantsForm({ form }: { form: NewForm<ProductForm> }) {
    return <>
        {
            form.variants.map(variant => <div id={variant.id}>

                <input {...variant.idAndNameOf('id')} type="hidden" value={variant.id} />

                <label for={variant.idOf('variantType')}>variant type</label>
                <input {...variant.idAndNameOf('variantType')} type="text" value={variant.variantType || ''} />

                <label for={variant.idOf('inventory')}>inventory</label>
                <input {...variant.idAndNameOf('inventory')} type="text" value={variant.inventory || ''} />

                <label for={variant.idOf('price')}>price</label>
                <input {...variant.idAndNameOf('price')} type="text" value={variant.price || ''} />

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
        pageState.variantIds.push(`variant-${new Date().getTime()}`);
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

export default server;