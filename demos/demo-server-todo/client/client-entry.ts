// client side entry
import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { Fetcher } from '@incremental-html/headlessui';
import { navigator } from '@incremental-html/navigator';

setEvalGlobals({
    Fetcher,
    navigator
})
startDomObserver();