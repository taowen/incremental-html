import morphdom from 'morphdom';

/**
 * mimic window.location behavior
 */
export const navigator = {
    /**
     * the JSON value of server generated <template class="page-state">
     * it will be sent back to server when navigator.reload() via a HTTP PUT request
     * because HTTP GET does not allow body
     */
    get pageState() {
        initPageState();
        return window.history.state?.pageState;
    },
    /**
     * like window.location.reload to refresh current page without changing url
     */
    async reload() {
        const pageState = this.pageState;
        const resp = await (pageState ? fetch(window.location.href, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pageState)
        }) : fetch(window.location.href));
        const respText = await resp.text();
        applyHtml(respText);
    },
    /**
     * like window.location.replace to change current page to a new url without new browser history entry
     * @param url providing new page content
     */
    async replace(url: string) {
        const resp = await fetch(url);
        const respText = await resp.text();
        applyHtml(respText);
        window.history.replaceState(respText, '', url);
    },
    /**
     * like window.location.assign to redirect current page to a new url with new browser history entry
     * @param url redirect to
     */
    async assign(url: string) {
        const resp = await fetch(url);
        const respText = await resp.text();
        window.history.replaceState(document.documentElement.innerHTML, '', window.location.href);
        window.addEventListener('popstate', onPopState);
        applyHtml(respText);
        window.history.pushState(respText, '', url);
    },
    /**
     * like window.location.href
     */
    get href() {
        return window.location.href;
    },
    /**
     * like window.location.href
     */
    set href(url: string) {
        this.assign(url);
    }
}

function initPageState() {
    const pageStateElement = (document.querySelector('template.page-state') as HTMLTemplateElement);
    if (!pageStateElement) {
        return;
    }
    if ((pageStateElement as any).$parsed) {
        return;
    }
    (pageStateElement as any).$parsed = true;
    const pageState = JSON.parse(pageStateElement.content.textContent!);
    window.history.replaceState({...window.history.state, pageState }, '', window.location.href);
}

function applyHtml(html: string) {
    const fakeDom = document.createElement('html');
    fakeDom.innerHTML = html;
    morphdom(document.body, fakeDom.querySelector('body')!, {
        getNodeKey(node) {
            if (node.nodeType === 1) {
                return (node as Element).id;
            }
            return '';
        },
        onBeforeElUpdated(fromEl, toEl) {
            if (toEl.tagName === 'INPUT' || toEl.tagName === 'TEXTAREA' || toEl.tagName === 'SELECT') {
                return false;
            }
            return true;
        }
    });
    document.title = fakeDom.querySelector('title')?.innerText || '';
}

async function onPopState(e: PopStateEvent) {
    applyHtml(e.state);
    const resp = await fetch(window.location.href);
    const respText = await resp.text();
    applyHtml(respText);
}