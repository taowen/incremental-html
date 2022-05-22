import { List } from '@incremental-html/headlessui';
import { setEvalGlobals, startDomObserver } from '@incremental-html/reactivity';

setEvalGlobals({ List })
startDomObserver();