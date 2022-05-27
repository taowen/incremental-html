import * as quicklink from 'quicklink';
import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { Motion } from '@incremental-html/motion';

// quicklink is optional, it is just to demo Chrome is making MPA faster and faster
// https://getquick.link/demo/ This page contains some demo sites that use Quicklink to improve navigation
// https://developer.chrome.com/blog/paint-holding/ Paint Holding - reducing the flash of white on same-origin navigations
window.addEventListener('load', () => {
  quicklink.listen();
});

setEvalGlobals({
    Motion,
})
startDomObserver();