import { morphChildNodes } from "@incremental-html/morph";
import { Feature } from "@incremental-html/reactivity";

export class Reloader extends Feature<{}> {
    public pageState = undefined;

    public async reload(url: string) {
        const respText = await (this.pageState ? sequentialFetch(url || window.location.href, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.pageState)
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

    private initPageState = () => {
        const pageStateElement = (document.querySelector('template.page-state') as HTMLTemplateElement);
        if (!pageStateElement) {
            return;
        }
        this.pageState = JSON.parse(pageStateElement.content.textContent!);
    }

    private _ = this.onMount(() => {
        this.autoReload();
        window.addEventListener('load', this.autoReload);
        this.initPageState();
        window.addEventListener('load', this.initPageState);
    });
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