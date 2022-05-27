// client side entry
import { Fetcher } from '@incremental-html/headlessui';
import { Toast } from '@incremental-html/motion';
import { navigator } from '@incremental-html/navigator';
import { Motion, Reorder } from '@incremental-html/motion';
import { closestFeature, setEvalGlobals, startDomObserver } from '@incremental-html/reactivity';
import initUnocssRuntime from '@unocss/runtime';
import presetUno from '@unocss/preset-uno';
import '@unocss/reset/tailwind.css'

setEvalGlobals({
    Reorder,
    Motion,
    Fetcher,
    Toast,
    closestFeature,
    navigator,
})
startDomObserver();
initUnocssRuntime({
    defaults: {
        presets: [presetUno()]
    }
})