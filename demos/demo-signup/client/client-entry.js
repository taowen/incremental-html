// client side entry
import { startDomObserver, setEvalGlobals, querySelector } from '@incremental-html/reactivity';
import { submitForm } from '@incremental-html/submit-form';

setEvalGlobals({
    submitForm,
    $: querySelector
})
startDomObserver();