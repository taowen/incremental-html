import { List } from '@incremental-html/headlessui';
import { navigator } from '@incremental-html/navigator';
import { setEvalGlobals, startDomObserver, closestFeature } from '@incremental-html/reactivity';

setEvalGlobals({ List, navigator, closestFeature })
startDomObserver();