// client side entry
import { startDomObserver } from '@incremental-html/reactivity';
import { onSubmit } from '@incremental-html/submit-form';

window.$$ = {
    onSubmit
};
startDomObserver();