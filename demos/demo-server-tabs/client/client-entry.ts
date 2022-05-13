import './all.css';
import { startDomObserver, setEvalGlobals } from '@incremental-html/reactivity';
import { Motion } from '@incremental-html/motion';
import { navigator } from '@incremental-html/navigator';

setEvalGlobals({ Motion, navigator });
// for properties like bind:xxx or on:xxx
startDomObserver();