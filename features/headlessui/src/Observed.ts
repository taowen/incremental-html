import { Feature, reactive } from "@incremental-html/reactivity";

export class Observed extends Feature<{}> {
    private state = reactive({
        value: undefined as any,
        width: undefined as any,
        height: undefined as any,
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

    public get width() {
        this.observeSize();
        return this.state.width;
    }

    public get height() {
        this.observeSize();
        return this.state.height;
    }
    
    private sizeObserving = false;
    private _2: any;
    private observeSize() {
        if (this.sizeObserving) {
            return;
        }
        this.sizeObserving = true;
        this.updateSize();
        this._2 = this.onMount(() => {
            const resizeObserver = new ResizeObserver(this.updateSize);
            resizeObserver.observe(this.element)
            return () => {
                resizeObserver.disconnect();
            }
        });
    }
    
    private updateSize = () => {
        const rect = this.element.getBoundingClientRect();
        this.state.height = rect.height;
        this.state.width = rect.width;
    }
}