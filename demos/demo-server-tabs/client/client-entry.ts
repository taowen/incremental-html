import './all.css';
import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { Motion } from '@incremental-html/motion';
import { Reloader } from '@incremental-html/headlessui';

setEvalGlobals({ Motion, Reloader });
// for properties like prop:xxx or on:xxx
startDomObserver();