import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { navigator } from '@incremental-html/navigator';

setEvalGlobals({ navigator })
startDomObserver();