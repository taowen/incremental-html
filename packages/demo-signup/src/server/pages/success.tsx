import { jsxToHtml } from 'incremental-html';

export function GET() {
    return <html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
            <link href="./src/server/pages/newsletter.css" rel="stylesheet" type="text/css" />
        </head>
        <body>
            <main>
                <div>
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