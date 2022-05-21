import { morphChildNodes } from '@incremental-html/morph';

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
    async reload(url?: string) {
        const pageState = this.pageState;
        const respText = await (pageState ? sequentialFetch(url || window.location.href, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pageState)
        }) : sequentialFetch(url || window.location.href));
        if (respText === null) {
            return;
        }
        applyHtml(respText);
    },
    /**
     * like window.location.replace to change current page to a new url without new browser history entry
     * @param url providing new page content
     */
    async replace(url: string) {
        const respText = await sequentialFetch(url);
        if (respText === null) {
            return;
        }
        applyHtml(respText);
        window.history.replaceState(respText, '', url);
    },
    /**
     * like window.location.assign to redirect current page to a new url with new browser history entry
     * @param url redirect to
     */
    async assign(url: string) {
        const respText = await sequentialFetch(url);
        if (respText === null) {
            return;
        }
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

/**
 * only one inflight request is allowed
 * because all the request will refresh the same browser page
 * if there is a later request started, we are sure it will return a more fresh result
 */
let inflightRequest: AbortController | undefined;

async function sequentialFetch(url: string, options?: RequestInit): Promise<string | null> {
    if (inflightRequest) {
        inflightRequest.abort();
    }
    const controller = new AbortController();
    inflightRequest = controller;
    try {
        const resp = await fetch(url, {...options, signal: controller.signal });
        const respText = await resp.text();
        if (!respText) {
            throw new Error(`response of ${url} is empty`)
        }
        return respText;
    } catch(e) {
        if (controller.signal.aborted) {
            return null;
        } else {
            throw e;
        }
    } finally {
        if (inflightRequest === controller) {
            inflightRequest = undefined;
        }
    }
}

function handleReload() {
    const reload = document.querySelector('link.reload') as HTMLLinkElement;
    if (!reload) {
        return;
    }
    if (reload.getAttribute('handled')) {
        return;
    }
    reload.setAttribute('handled', 'true');
    navigator.reload(reload.href);
}
handleReload();
window.addEventListener('load', handleReload);

function initPageState() {
    const pageStateElement = (document.querySelector('template.page-state') as HTMLTemplateElement);
    if (!pageStateElement) {
        window.history.replaceState({}, '', window.location.href);
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
    document.title = fakeDom.querySelector('title')?.innerText || '';
    morphChildNodes(document.body, fakeDom.querySelector('body')!);
}

async function onPopState(e: PopStateEvent) {
    applyHtml(e.state);
    const resp = await fetch(window.location.href);
    const respText = await resp.text();
    applyHtml(respText);
}