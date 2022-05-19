import { morph, morphChildNodes, morphInnerHTML } from '@incremental-html/morph';
import { computed, ComputedRef, effect, isRef, ReactiveEffectRunner } from '@vue/reactivity';
import { copyFrom } from './copyFrom';
import { callEventHandlerAsync, evalExpr } from './eval';
import { Feature } from './Feature';
import { camelize } from './naming';
import { notifyNodeSubscribers } from './subscribeNode';

let nextId = 1;

export function startDomObserver() {
    return mountElement(document.body);
}

export function stopDomObserver() {
    mutationObserver.disconnect();
    delete (document.body as any).$xid;
}

morphChildNodes.morphProperties = (oldEl, newEl) => {
    // @incremental/template render will set $props to new element
    // if old element reused, we need to propagate $props to old element
    (oldEl as any).$props = (newEl as any).$props;
    if ((oldEl as any).$bindings) {
        for (const binding of Object.values((oldEl as any).$bindings)) {
            (binding as ReactiveEffectRunner<any>)();
        }
    }
};

morphChildNodes.beforeRemove = (el) => {
    return unmountElement(el);
};

export const mutationObserver = new MutationObserver((mutationList) => {
    let toNotify: Set<string> | undefined;
    for (const mutation of mutationList) {
        if (mutation.attributeName === 'style') {
            // avoid animation trigger observer recompute
            continue;
        }
        if (mutation.attributeName) {
            if (!toNotify) {
                toNotify = new Set();
            }
            toNotify.add((mutation.target as any).$xid)
        }
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            const addedNode = mutation.addedNodes.item(i)!;
            if (addedNode.nodeType === 1 && addedNode.parentElement) {
                mountElement(addedNode as Element);
            }
        }
        for (let i = 0; i < mutation.removedNodes.length; i++) {
            const removedNode = mutation.removedNodes.item(i) as Element;
            if (!removedNode.parentNode && removedNode.nodeType === 1) {
                unmountElement(removedNode);
            }
        }
    }
    if (toNotify) {
        for (const xid of toNotify) {
            notifyNodeSubscribers(xid);
        }
    }
});

function unmountElement(element: Element): Promise<void> | void {
    if ((element as any).$unmounted) {
        return;
    }
    (element as any).$unmounted = true;
    if ((element as any).$computedProps) {
        for (const computedProp of Object.values((element as any).$computedProps)) {
            (computedProp as ComputedRef<any>).effect.stop();
        }
    }
    if ((element as any).$bindings) {
        for (const binding of Object.values((element as any).$bindings)) {
            (binding as ReactiveEffectRunner<any>).effect.stop();
        }
    }
    const promises = [];
    if ((element as any).$features) {
        for (const feature of (element as any).$features.values()) {
            const promise = feature.unmount();
            if (promise) {
                promises.push(promise);
            }
        }
    }
    for (let i = 0; i < element.children.length; i++) {
        const promise = unmountElement(element.children[i]);
        if (promise) {
            promises.push(promise);
        }
    }
    if (promises.length === 0) {
        return undefined;
    } else if (promises.length === 1) {
        return promises[0];
    } else {
        return Promise.all(promises) as any;
    }
}

function mountElement(element: Element) {
    if ((element as any).$xid) {
        return (element as any).$xid;
    }
    const xid = `n${nextId++}`;
    (element as any).$xid = xid;
    if (element.tagName === 'TEMPLATE') {
        return;
    }
    const copyFromSelector = element.getAttribute('copy-from');
    if (copyFromSelector) {
        const template = document.querySelector(copyFromSelector);
        if (template) {
            element.removeAttribute('copy-from');
            copyFrom(element, template as HTMLTemplateElement);
        } else {
            console.error(`copy-from ${copyFromSelector} not found`);
        }
    }
    if (element.tagName === 'INPUT') {
        element.addEventListener('input', () => {
            const ref = (element as any).$valueRef;
            if (ref) {
                ref.value = (element as HTMLInputElement).value;
            }
            notifyNodeSubscribers(xid);
        });
        const superProps = Object.getPrototypeOf(element);
        const superSet = Object.getOwnPropertyDescriptor(superProps, "value")!.set!;
        const superGet = Object.getOwnPropertyDescriptor(superProps, "value")!.get!;
        Object.defineProperty(element, "value", {
            get: function () {
                return superGet.apply(this);
            },
            set: function (t) {
                if (isRef(t)) {
                    this.$valueRef = t;
                    t = t.value;
                } else {
                    delete this.$valueRef;
                }
                superSet.call(this, t);
                notifyNodeSubscribers(xid);
            }
        });
    }
    for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        if (attr.name.startsWith('on:')) {
            const eventName = attr.name.substring('on:'.length);
            element.addEventListener(eventName, (...args) => {
                const [event] = args;
                event.preventDefault();
                event.stopPropagation();
                callEventHandlerAsync(element, eventName, ...args);
            })
        } else if (attr.name.startsWith('prop:')) {
            let computedProps = (element as any).$computedProps;
            if (!computedProps) {
                (element as any).$computedProps = computedProps = {};
            }
            const propName = camelize(attr.name.substring('prop:'.length));
            const computedProp = computed(() => {
                let value = undefined;
                try {
                    value = evalExpr(attr.value, element);
                } catch (e) {
                    console.error(`failed to eval ${attr.name} of `, element, e);
                }
                return value;
            });
            computedProps[propName] = computedProp;
            if (isExistingProp(element, propName)) {
                // existing DOM node property, make a data binding here
                let bindings = (element as any).$bindings;
                if (!bindings) {
                    (element as any).$bindings = bindings = {};
                }
                bindings[propName] = effect(() => {
                    computedProp.value; // subscribe
                    markDirty(element, propName); // delay the actual DOM changes to next tick
                });
            } else {
                // define new property
                Object.defineProperty(element, propName, {
                    enumerable: true,
                    get() {
                        return computedProp.value;
                    }
                })
            }
        } else if (attr.name.startsWith('use:')) {
            let featureClass = evalExpr(attr.value, element);
            const featureName = attr.name.substring('use:'.length);
            createFeature(featureClass, element, featureName);
        }
    }
    for (let i = 0; i < element.children.length; i++) {
        mountElement(element.children[i])
    }
    mutationObserver.observe(element, {
        attributes: true,
        attributeOldValue: false,
        childList: true,
        subtree: false
    });
    return xid;
}

function isExistingProp(obj: any, propName: string): any {
    if (propName === 'innerHtml' || propName.startsWith('class.') || propName.startsWith('style.')) {
        return true;
    }
    if (!obj) {
        return false;
    }
    const desc = Object.getOwnPropertyDescriptor(obj, propName);
    if (desc) {
        return desc;
    }
    return isExistingProp(Object.getPrototypeOf(obj), propName);
}

function createFeature(featureClass: any, element: Element, featureName: string) {
    const prefix = `${featureName}:`;
    if (typeof featureClass !== 'function') {
        throw new Error(`invalid feature class: ${featureClass}`);
    }
    const isSubclassOfFeature = featureClass.prototype.__proto__ === Feature.prototype;
    if (isSubclassOfFeature) {
        const feature = new featureClass(element, prefix);
        setNodeProperty(element, camelize(featureName), feature);
        return;
    }
    return (async () => {
        const { default: lazyLoadedFeatureClass } = await (featureClass());
        const feature = new lazyLoadedFeatureClass(element);
        setNodeProperty(element, camelize(featureName), feature);
    })();
}

let scheduler: { current: Promise<void> | undefined } = { current: undefined };
const dirtyElements = new Set<Element>();

function markDirty(element: Element, propName: string) {
    let dirtyProps = (element as any).$dirtyProps;
    if (!dirtyProps) {
        (element as any).$dirtyProps = dirtyProps = new Set<string>();
    }
    dirtyProps.add(propName);
    dirtyElements.add(element);
    schedule();
}

function schedule() {
    if (scheduler.current) {
        return scheduler.current;
    }
    return scheduler.current = (async () => {
        await new Promise<void>(resolve => resolve());
        scheduler.current = undefined;
        try {
            applyChanges()
        } catch (e) {
            console.error('unexpected error', e);
        }
    })();
}

function applyChanges() {
    const toApply = [...dirtyElements];
    dirtyElements.clear();
    for (const el of toApply) {
        const computedProps = (el as any).$computedProps;
        const dirtyProps: Set<string> = (el as any).$dirtyProps
        if (!computedProps || !dirtyProps) {
            continue;
        }
        const innerHtmlIsDirty = dirtyProps.delete('innerHtml')
        const childNodesIsDirty = dirtyProps.delete('childNodes')
        const toApplyProps = [...dirtyProps];
        dirtyProps.clear();
        if (toApplyProps.length > 0) {
            morph(el, () => {
                for (const propName of toApplyProps) {
                    setNodeProperty(el, propName, computedProps[propName].value);
                }
            })
        }
        if (innerHtmlIsDirty) {
            morphInnerHTML(el, computedProps.innerHtml.value);
        }
        if (childNodesIsDirty) {
            morphChildNodes(el, computedProps.childNodes.value);
        }
    }
}

export function nextTick(): Promise<void> {
    return schedule();
}

function setNodeProperty(node: Element, name: string, value: any) {
    if (name.startsWith('style.')) {
        Reflect.set((node as HTMLElement).style, name.substring('style.'.length), value)
        return;
    }
    if (name === 'class') {
        node.className = value;
        return;
    }
    if (name.startsWith('class.')) {
        value = ' ' + value;
        const oldClass = Reflect.get(node, name);
        Reflect.set(node, name, value);
        if (oldClass) {
            node.className = node.className.replace(oldClass, '') + value;
        } else {
            node.className = node.className + value;
        }
        return;
    }
    Reflect.set(node, name, value);
}