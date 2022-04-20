import morphdom from 'morphdom';

export const navigator = {
    async reload() {
        const resp = await fetch(window.location.href);
        const respText = await resp.text();
        const node = document.createElement('html');
        node.innerHTML = respText;
        morphdom(document.body, node.querySelector('body')!, {
            onBeforeElUpdated(fromEl, toEl) {
                if (toEl.tagName === 'INPUT' || toEl.tagName === 'TEXTAREA' || toEl.tagName === 'SELECT') {
                    return false;
                }
                return true;
            }
        });
    },
    replace(url: string) {

    },
    get href() {
        return window.location.href;
    },
    set href(url: string) {
    }
}