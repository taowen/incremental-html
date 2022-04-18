import { jsxToHtml } from '@incremental-html/jsx-to-html';
import { createForm, decodeForm, sendFormErrors } from '@incremental-html/form-object';
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
    return;
}

export function GET() {
    const form = createForm({} as SignupForm);
    return <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
            <link href="./src/server/pages/newsletter.css" rel="stylesheet" type="text/css" />
        </head>
        <body>
            <main>
                <form method="post" onSubmit="$$.onSubmit(...arguments)">
                    <h2>Subscribe!</h2>
                    <p>Don't miss any of the action!</p>
                    <fieldset>
                        <input
                            aria-label="Email address"
                            aria-describedby="error-message"
                            type="email"
                            name={form.nameOf('email')}
                            placeholder="you@example.com"
                            onInput="this.closest('form').setAttribute('error', '')"
                        />
                        <button type="submit" 
                            _innerHTML="this.closest('form').getAttribute('submitting') ? 'Subscribing...' : 'Subscribe'">
                        </button>
                    </fieldset>

                    <p id="error-message" 
                        _innerHTML="this.closest('form').getAttribute('error') || '\xa0'">
                    </p>
                </form>
            </main>
        </body>
    </html>;
}