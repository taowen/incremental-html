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
                <form method="post" use:fetcher="$Fetcher" on:submit="
                await this.fetcher.submit();
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
                            on:input="$closestFeature(this, $Fetcher).error = null"
                        />
                        <button type="submit" 
                            prop:submitting="$closestFeature(this, $Fetcher).isSubmitting"
                            prop:text-content="this.submitting ? 'Subscribing...' : 'Subscribe'"
                            prop:disabled="this.submitting ? true : false">
                        </button>
                    </fieldset>

                    <p id="error-message" 
                        prop:text-content="$closestFeature(this, $Fetcher).error || '\xa0'">
                    </p>
                </form>
            </main>
        </body>
    </html>;
}