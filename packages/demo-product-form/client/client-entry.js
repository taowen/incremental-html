// client side entry
import { startDomObserver, evalGlobals } from '@incremental-html/reactivity';
import { submitForm } from '@incremental-html/submit-form';
import { navigator } from '@incremental-html/navigator';

Object.assign(evalGlobals, {
    submitForm,
    navigator,
    // demo js bundle chunking
    MyFeature: () => import('./MyFeature')
})
startDomObserver();