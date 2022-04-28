// client side entry
import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { submitForm } from '@incremental-html/submit-form';

setEvalGlobals({
    submitForm
})
startDomObserver();