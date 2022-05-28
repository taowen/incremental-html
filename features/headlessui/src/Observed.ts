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
    private observeValue() {
        if (this.valueObserving) {
            return;
        }
        this.valueObserving = true;
        this.state.value = (this.element as HTMLInputElement).value
        this.element.addEventListener('input', () => {
            this.state.value = (this.element as HTMLInputElement).value;
        });
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
    }
}