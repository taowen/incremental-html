// client side entry
import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { submitForm } from '@incremental-html/submit-form';
import { navigator } from '@incremental-html/navigator';

setEvalGlobals({
    submitForm,
    navigator,
})
startDomObserver();