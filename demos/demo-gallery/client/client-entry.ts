import { List } from '@incremental-html/headlessui';
import { navigator } from '@incremental-html/navigator';
import { setEvalGlobals, startDomObserver, queryFeature } from '@incremental-html/reactivity';

setEvalGlobals({ List, navigator, queryFeature })
startDomObserver();