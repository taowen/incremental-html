// client side entry
import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { Fetcher, Reloader } from '@incremental-html/headlessui';
import { Motion } from '@incremental-html/motion';

setEvalGlobals({
    Fetcher,
    Reloader,
    Motion,
})
startDomObserver();