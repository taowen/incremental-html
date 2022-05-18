import { Feature } from '@incremental-html/reactivity';
import { navigator } from './navigator';

export class Reload extends Feature<{}> {
    private _ = this.onMount(() => {
        navigator.reload((this.element as HTMLLinkElement).href);
    })
}