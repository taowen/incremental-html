// client side entry
import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { Fetcher, Reloader } from '@incremental-html/headlessui';

setEvalGlobals({
    Fetcher,
    Reloader,
})
startDomObserver();