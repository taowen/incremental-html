import { computed, effect } from "@vue/reactivity";
import { evalExpr } from "./eval";
import { camelize } from "./naming";
import { subscribeNode } from "./subscribeNode";

export class Feature<Props extends Record<string, any>> {
    private computedProps: { value: Record<string, any> }
    constructor(public readonly element: Element, protected readonly prefix: string | (() => Props)) {
        let features = (element as any).$features;
        if (!features) {
            features = (element as any).$features = new Map();
        }
        features.set(this.constructor, this);
        this.computedProps = computed(() => {
            if (typeof prefix !== 'string') {
                return prefix();
            }
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
    }

    private makeGettersCached() {
        const proto = Object.getPrototypeOf(this);
        for (const propName of Object.getOwnPropertyNames(proto)) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, propName);
            if (descriptor?.get) {
                const computedProp = computed(descriptor.get.bind(this));
                descriptor.get = () => {
                    return computedProp.value;
                }
                Object.defineProperty(this, propName, descriptor);
            }
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
        return effect(() => {
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
        }).effect;
    }

    protected onMount(fn: () => void | (() => void)) {
        const unmount = fn();
        return { unmount }
    }

    protected create<T>(fn: () => T): T {
        return fn();
    }

    public unmount() {
        const promises = [];
        for (const v of Object.values(this)) {
            const unmount = (v as any)?.unmount || (v as any)?.stop;
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

export function queryFeature<T>(element: Node | null | undefined, featureClass: { new (element: Element, prefix: string): T; }): T | undefined {
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