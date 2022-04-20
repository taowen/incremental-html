import { jsxToHtml } from '@incremental-html/jsx-to-html';
import { createForm, decodeForm } from '@incremental-html/form-object';
import { Request, Response } from 'express';

interface SignupForm {
    email: string;
}

export async function POST(req: Request, resp: Response) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const form = decodeForm<SignupForm>(req.body);
    form.setError('email', 'required');
    if (form.sendErrors(resp, 'validation failed')) {
        return;
    }
    resp.status(200).set({ 'Content-Type': 'application/json' }).end('');
}

export function GET() {
    const form = createForm({} as SignupForm);
    return <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
            <link href="./server/pages/newsletter.css" rel="stylesheet" type="text/css" />
        </head>
        <body>
            <main>
                <form method="post" on:submit="
                const [e] = arguments;
                const form = e.target;
                form.setAttribute('submitting', 'true');
                try {
                    await $$.submitForm(form)
                } finally {
                    form.setAttribute('submitting', '');
                }
                ">
                    <h2>Subscribe!</h2>
                    <p>Don't miss any of the action!</p>
                    <fieldset>
                        <input
                            aria-label="Email address"
                            aria-describedby="error-message"
                            type="email"
                            name={form.nameOf('email')}
                            placeholder="you@example.com"
                            on:input="this.closest('form').setAttribute('error', '')"
                        />
                        <button type="submit" 
                            bind:textContent="this.closest('form').getAttribute('submitting') ? 'Subscribing...' : 'Subscribe'">
                        </button>
                    </fieldset>

                    <p id="error-message" 
                        bind:textContent="this.closest('form').getAttribute('error') || '\xa0'">
                    </p>
                </form>
            </main>
        </body>
    </html>;
}