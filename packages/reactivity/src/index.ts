import { startDomObserver } from './startDomObserver';

export * from '@vue/reactivity';
export * from './Feature';
export { setEvalGlobals } from './eval';
export { startDomObserver, stopDomObserver, nextTick } from './startDomObserver';
export { querySelector, subscribeNode } from './subscribeNode';

if (typeof document !== 'undefined' && document.currentScript && document.currentScript.hasAttribute('init')) {
    startDomObserver();
}