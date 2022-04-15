// client side entry
import { startDomObserver } from '@incremental-html/reactivity';
import { submitForm } from '@incremental-html/submit-form';

window.$$ = {
    submitForm
}
startDomObserver()