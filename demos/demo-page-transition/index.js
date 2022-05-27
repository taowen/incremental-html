import * as quicklink from 'quicklink';
import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { Motion } from '@incremental-html/motion';

window.addEventListener('load', () => {
  quicklink.listen();
});

setEvalGlobals({
    Motion,
})
startDomObserver();