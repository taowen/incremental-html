import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { Reloader } from '@incremental-html/headlessui';

setEvalGlobals({ Reloader })
startDomObserver();