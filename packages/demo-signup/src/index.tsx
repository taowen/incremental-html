import jsxToHtml from './jsxToHtml';

export function render() {
    return jsxToHtml(<html>
        <head>
            <meta http-equiv="content-type" content="text/html; charset=utf-8" />
            <title>Demo</title>
            <link rel="shortcut icon" href="#" />
        </head>
        <body>
        hello
        </body>
    </html>)
}