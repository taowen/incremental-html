import { startDomObserver } from '@incremental-html/reactivity';
import { navigator } from '@incremental-html/navigator';

const reload = document.getElementById('reload') as HTMLLinkElement;
if (reload) {
    navigator.reload(reload.href);
}
startDomObserver();