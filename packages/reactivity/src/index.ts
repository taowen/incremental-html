import { startDomObserver } from './startDomObserver';

export * from './startDomObserver';
export { renderTemplate } from './renderTemplate';
export * from './Feature';
export * from '@vue/reactivity';
export { setEvalGlobals } from './eval';
export { querySelector, subscribeNode } from './subscribeNode';

if (typeof document !== 'undefined' && document.currentScript && document.currentScript.hasAttribute('init')) {
    startDomObserver();
}