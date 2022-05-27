import { morphChildNodes } from "@incremental-html/morph";
import { Feature } from "@incremental-html/reactivity";

export class Reloader extends Feature<{}> {
    public async reload(url: string) {
        const pageState = initPageState();
        const respText = await (pageState ? sequentialFetch(url || window.location.href, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pageState)
        }) : sequentialFetch(url || window.location.href));
        if (respText === null) {
            return;
        }
        applyHtml(respText);
    }

    private autoReload = () => {
        const reload = document.querySelector('link.reload') as HTMLLinkElement;
        if (!reload) {
            return;
        }
        if (reload.getAttribute('handled')) {
            return;
        }
        reload.setAttribute('handled', 'true');
        this.reload(reload.href);
    }

    private _ = this.onMount(() => {
        this.autoReload();
        window.addEventListener('load', this.autoReload);
    });
}

let pageState: Record<string, any> | undefined | false;

function initPageState(): Record<string, any> | false {
    if (pageState !== undefined) {
        return pageState;
    }
    const pageStateElement = (document.querySelector('template.page-state') as HTMLTemplateElement);
    if (!pageStateElement) {
        return pageState = false;
    }
    return pageState = JSON.parse(pageStateElement.content.textContent!);
}

function applyHtml(html: string) {
    const fakeDom = document.createElement('html');
    fakeDom.innerHTML = html;
    document.title = fakeDom.querySelector('title')?.innerText || '';
    morphChildNodes(document.body, fakeDom.querySelector('body')!);
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