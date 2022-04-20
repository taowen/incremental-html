import morphdom from 'morphdom';

export const navigator = {
    async reload() {
        const resp = await fetch(window.location.href);
        const respText = await resp.text();
        const node = document.createElement('html');
        node.innerHTML = respText;
        morphdom(document.body, node.querySelector('body')!);
    },
    replace(url: string) {

    },
    get href() {
        return window.location.href;
    },
    set href(url: string) {
    }
}