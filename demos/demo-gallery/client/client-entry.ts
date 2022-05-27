import { List, Reloader } from '@incremental-html/headlessui';
import { setEvalGlobals, startDomObserver, closestFeature } from '@incremental-html/reactivity';

setEvalGlobals({ List, Reloader, closestFeature })
startDomObserver();