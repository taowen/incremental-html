import { computed, effect } from "@vue/reactivity";
import { evalSync } from "./eval";
import { camelize } from "./naming";
import { subscribeNode } from "./subscribeNode";

export class Feature<Props extends Record<string, any>> {
    private computedProps: { value: Record<string, any> }
    constructor(public element: Element, prefix: string) {
        let features = (element as any).features;
        if (!features) {
            features = (element as any).features = new Map();
        }
        features.set(this.constructor, this);
        this.computedProps = computed(() => {
            subscribeNode(this.element);
            const props: Record<string, any> = { element };
            for (let i = 0; i < element.attributes.length; i++) {
                const attr = element.attributes[i];
                if (attr.name.startsWith(prefix)) {
                    const propName = camelize(attr.name.substring(prefix.length));
                    props[propName] = evalSync(attr.value, element);
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

    protected create<T>(fn: () => T): T {
        return fn();
    }
}

export function queryFeature<T>(element: Element, featureClass: { new (element: Element): T; featureName: string }): T | undefined {
    if (!element) {
        return undefined;
    }
    const features = (element as any).features;
    if (!features) {
        return queryFeature(element.parentElement!, featureClass);
    }
    const feature = features.get(featureClass)
    if (!feature) {
        return queryFeature(element.parentElement!, featureClass);
    }
    return feature;
}