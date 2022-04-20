// client side entry
import { startDomObserver } from '@incremental-html/reactivity';
import { submitForm } from '@incremental-html/submit-form';
import { navigator } from '@incremental-html/navigator';

window.$$ = {
    submitForm,
    navigator
};
startDomObserver();