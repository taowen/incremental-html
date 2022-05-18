import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { Reload } from '@incremental-html/navigator';

setEvalGlobals({ Reload })
startDomObserver();