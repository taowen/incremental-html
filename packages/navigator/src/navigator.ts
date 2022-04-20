import morphdom from 'morphdom';

export const navigator = {
    async reload() {
        const resp = await fetch(window.location.href);
        const respText = await resp.text();
        applyHtml(respText);
    },
    async replace(url: string) {
        const resp = await fetch(url);
        const respText = await resp.text();
        applyHtml(respText);
        window.history.replaceState(respText, document.getElementsByTagName('title')[0].innerText, url);
    },
    async assign(url: string) {
        const resp = await fetch(url);
        const respText = await resp.text();
        history.replaceState(document.documentElement.innerHTML, '', window.location.href);
        window.addEventListener('popstate', onPopState);
        applyHtml(respText);
        window.history.pushState(respText, document.getElementsByTagName('title')[0].innerText, url);
    },
    get href() {
        return window.location.href;
    },
    set href(url: string) {
        this.assign(url);
    }
}

function applyHtml(html: string) {
    const node = document.createElement('html');
    node.innerHTML = html;
    morphdom(document.body, node.querySelector('body')!, {
        onBeforeElUpdated(fromEl, toEl) {
            if (toEl.tagName === 'INPUT' || toEl.tagName === 'TEXTAREA' || toEl.tagName === 'SELECT') {
                return false;
            }
            return true;
        }
    });
    node.innerHTML = '';
}

async function onPopState(e: PopStateEvent) {
    applyHtml(e.state);
    navigator.replace(window.location.href);
}