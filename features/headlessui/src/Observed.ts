import { Feature, reactive } from "@incremental-html/reactivity";

export class Observed extends Feature<{}> {
    private state = reactive({
        value: undefined as any
    })
    public get value() {
        this.observeValue();
        return this.state.value;
    }
    public set value(newValue: any) {
        (this.element as HTMLInputElement).value = newValue;
    }
    private valueObserving = false;
    private _1: any;
    private observeValue() {
        if (this.valueObserving) {
            return;
        }
        this.valueObserving = true;
        this._1 = this.onMount(() => {
            this.state.value = (this.element as HTMLInputElement).value
            const listener = () => {
                this.state.value = (this.element as HTMLInputElement).value;
            }
            this.element.addEventListener('input', listener);
            const superProps = Object.getPrototypeOf(this.element);
            const superSet = Object.getOwnPropertyDescriptor(superProps, "value")!.set!;
            const superGet = Object.getOwnPropertyDescriptor(superProps, "value")!.get!;
            const reactiveState = this.state;
            Object.defineProperty(this.element, "value", {
                get: function () {
                    return superGet.apply(this);
                },
                set: function (t) {
                    reactiveState.value = t;
                    superSet.call(this, t);
                }
            });
            return () => {
                this.element.removeEventListener('input', listener);
                Object.defineProperty(this.element, "value", {
                    get: superGet,
                    set: superSet
                });
            }
        })
    }
}