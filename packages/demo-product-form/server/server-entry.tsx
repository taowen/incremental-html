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

server.put('/', async (req, resp) => {
    await sendHtml(resp, <ProductFormPage pageState={req.body} form={createForm(req.body as ProductForm)} />);
})

server.get('/', async (req, resp) => {
    await sendHtml(resp, <ProductFormPage pageState={asPageState(theProduct)} form={createForm(theProduct)} />);
});

// to make the size smaller
function asPageState(form: ProductForm): PageState {
    return {
        hasVariants: !!form.hasVariants,
        variants: (form.variants || []).map(v => { return { id: v.id } })
    }
}

async function ProductFormPage({ pageState, form }: { pageState: PageState, form: NewForm<ProductForm> }) {
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
                const variants = $$.navigator.pageState.variants;
                for (let i = 0; i < variants.length; i++) {
                    if (variants[i].id === thisVariantId) {
                        variants.splice(i, 1);
                        break;
                    }
                }
                $$.navigator.reload();
                ">x</button>
            </div>)
        }
        <div><button on:click="
        const pageState = $$.navigator.pageState;
        pageState.variants.push({ id: `variant-${new Date().getTime()}` });
        $$.navigator.reload();
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