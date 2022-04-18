import { jsxToHtml } from '@incremental-html/jsx-to-html';
import { createForm, decodeForm, sendFormErrors } from '@incremental-html/form-object';
import { Request, Response } from 'express';

interface SignupForm {
    email: string;
}

export function POST(req: Request, resp: Response) {
    const form = decodeForm<SignupForm>(req.body);
    form.setError('email', 'required');
    if (form.sendErrors(resp, 'validation failed')) {
        return;
    }
    return;
}

export function GET() {
    const form = createForm({} as SignupForm);
    const state: "idle" | "success" | "error" | "submitting" = 'idle' as any;
    const actionData = {} as any;
    return <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
            <link href="./src/server/pages/newsletter.css" rel="stylesheet" type="text/css" />
        </head>
        <body>
            <main>
                <form method="post" aria-hidden={state === "success"} onSubmit="$$.onSubmit(...arguments)">
                    <h2>Subscribe!</h2>
                    <p>Don't miss any of the action!</p>
                    <fieldset>
                        <input
                            aria-label="Email address"
                            aria-describedby="error-message"
                            type="email"
                            name={form.nameOf('email')}
                            placeholder="you@example.com"
                        />
                        <button type="submit">
                            {state === "submitting" ? "Subscribing..." : "Subscribe"}
                        </button>
                    </fieldset>

                    <p id="error-message">
                        {state === "error" ? actionData.message : <>&nbsp;</>}
                    </p>
                </form>

                <div aria-hidden={state !== "success"}>
                    <h2 tabindex={-1}>
                        You're subscribed!
                    </h2>
                    <p>Please check your email to confirm your subscription.</p>
                    <a>Start over</a>
                </div>
            </main>
        </body>
    </html>;
}