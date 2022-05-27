// client side entry
import { Fetcher, Reloader } from '@incremental-html/headlessui';
import { Toast } from '@incremental-html/motion';
import { Motion, Reorder } from '@incremental-html/motion';
import { closestFeature, setEvalGlobals, startDomObserver } from '@incremental-html/reactivity';
import initUnocssRuntime from '@unocss/runtime';
import presetUno from '@unocss/preset-uno';
import '@unocss/reset/tailwind.css'

setEvalGlobals({
    Reorder,
    Motion,
    Reloader,
    Fetcher,
    Toast,
    closestFeature,
})
startDomObserver();
initUnocssRuntime({
    defaults: {
        presets: [presetUno()]
    }
})