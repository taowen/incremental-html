import { computed, effect, Ref, ref } from "@vue/reactivity";
import { evalExpr } from "./eval";
import { camelize } from "./naming";
import { subscribeNode } from "./subscribeNode";

export class Feature<Props extends Record<string, any>> {
    private computedProps: { value: Record<string, any> }
    public readonly element: HTMLElement;
    /**
     * create a feature by DOM or by code
     * @param element the DOM element this feature controls
     * @param propsProvider if feature is created by DOM element, the propsProvider is a attribute prefix, the actual props will be collected from the DOM element.
     * if feature is created by code, the propsProvider is a callback function to provide the actual props to use.
     */
    constructor(element: Element, protected readonly propsProvider: string | (() => Props)) {
        this.element = element as HTMLElement;
        let features = (element as any).$features;
        if (!features) {
            features = (element as any).$features = new Map();
        }
        features.set(this.constructor, this);
        this.computedProps = computed(() => {
            if (typeof propsProvider !== 'string') {
                return propsProvider();
            }
            const prefix = propsProvider;
            subscribeNode(element);
            const props: Record<string, any> = {};
            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                if (attr.name.startsWith(prefix)) {
                    const propName = camelize(attr.name.substring(prefix.length));
                    if (attr.value) {
                        props[propName] = evalExpr(attr.value, element);
                    } else {
                        props[propName] = true;
                    }
                }
            }
            return props;
        })
        this.makeGettersCached();
        // invalidate queryFeature, trigger re-run
        getInstanceCounter(this.constructor).value += 1;
    }

    private makeGettersCached() {
        const proto = Object.getPrototypeOf(this);
        for (const propName of Object.getOwnPropertyNames(proto)) {
            this.makeGetterCached(proto, propName);
        }
    }

    private makeGetterCached(proto: any, propName: string) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, propName);
        const getFunc = descriptor?.get;
        if (getFunc && !descriptor.set) {
            const computedProp = computed(() => {
                return getFunc.call(this);
            });
            descriptor.get = () => {
                return computedProp.value;
            }
            Object.defineProperty(this, propName, descriptor);
        }
    }
    
    public get props(): Props {
        return this.computedProps.value as Props;
    }

    protected on(event: string, listener: (this: Element, ev: Event) => any, options?: boolean | AddEventListenerOptions) {
        this.element.addEventListener(event, listener, options);
        return listener;
    }

    protected effect(fn: () => void | (() => void)) {
        let onStop: any;
        const e = effect(() => {
            if (onStop) {
                onStop();
            }
            onStop = fn();
        }, {
            onStop: () => {
                if (onStop) {
                    onStop();
                }
            }
        });
        return { __unmount__: () => e.effect.stop() }
    }

    protected onMount(fn: () => void | (() => void)) {
        const __unmount__ = fn();
        return { __unmount__ }
    }

    protected create<T>(fn: () => T): T {
        return fn();
    }

    public __unmount__() {
        const promises = [];
        for (const v of Object.values(this)) {
            const unmount = (v as any)?.__unmount__;
            if (unmount) {
                const promise = unmount.call(v);
                if (promise) {
                    promises.push(promise);
                }
            }
        }
        if (promises.length === 0) {
            return undefined;
        } else if (promises.length === 1) {
            return promises[0]
        } else {
            return Promise.all(promises);
        }
    }
}

function getInstanceCounter(featureClass: any): Ref<number> {
    if (!featureClass.instanceCounter) {
        return featureClass.instanceCounter = ref(0);
    } else {
        return featureClass.instanceCounter;
    }
}

export function queryFeature<T>(element: Node | null | undefined, featureClass: { new (element: Element, prefix: string): T; }): T | undefined {
    getInstanceCounter(featureClass).value; // will run queryFeature again when new feature created
    if (element?.nodeType !== 1) {
        return undefined;
    }
    const features = (element as any).$features;
    if (!features) {
        return queryFeature(element.parentElement!, featureClass);
    }
    const feature = features.get(featureClass)
    if (!feature) {
        return queryFeature(element.parentElement!, featureClass);
    }
    return feature;
}