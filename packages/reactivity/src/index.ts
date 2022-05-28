import { startDomObserver } from './startDomObserver';

export * from '@vue/reactivity';
export * from './Feature';
export { setEvalGlobals } from './eval';
export { startDomObserver, stopDomObserver, nextTick, mountElement, unmountElement, scheduleAttrChange, schedulePropChange } from './startDomObserver';

if (typeof document !== 'undefined' && document.currentScript && document.currentScript.hasAttribute('init')) {
    startDomObserver();
}