import './all.css';
import { startDomObserver, setEvalGlobals, reactive, renderTemplate } from '@incremental-html/reactivity';
import { Motion } from '@incremental-html/motion';
import { navigator } from '@incremental-html/navigator';

setEvalGlobals({ Motion, reactive, renderTemplate, navigator });
// for properties like bind:xxx or on:xxx
startDomObserver();