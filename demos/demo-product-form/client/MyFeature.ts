import { Feature } from "@incremental-html/reactivity";

export default class extends Feature<{}> {
    private _ = this.effect(() => {
        console.log('!!! start my feature');
    })
}