import { ref, Ref } from '@incremental-html/reactivity';

export class Drag {
    public x: Ref<number> = ref(0);
    public y: Ref<number> = ref(0);
    constructor(props: { element: Element, direction?: 'x' | 'y' }) {
        if (props.direction) {
            props.element.setAttribute(`bind:style.transform.translate-${props.direction}`, `this.drag.${props.direction}.value`);
        } else {
            props.element.setAttribute('bind:style.transform.translate-x', 'this.drag.x.value');
            props.element.setAttribute('bind:style.transform.translate-y', 'this.drag.y.value');
        }
        // demo change x
        (async () => {
            for (let i = 0; i < 100; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                this.x.value = 10 * i;
            }
        })();
    }
}