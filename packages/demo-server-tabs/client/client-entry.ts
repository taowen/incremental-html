import './all.css';
import { startDomObserver, setEvalGlobals, reactive, renderTemplate } from '@incremental-html/reactivity';
import { Motion } from '@incremental-html/motion';

setEvalGlobals({ Motion, reactive, renderTemplate });
// for properties like bind:xxx or on:xxx
startDomObserver();