// client side entry
import { startDomObserver, setEvalGlobals, closestFeature } from '@incremental-html/reactivity';
import { Fetcher } from '@incremental-html/headlessui';

setEvalGlobals({
    Fetcher,
    closestFeature,
})
startDomObserver();