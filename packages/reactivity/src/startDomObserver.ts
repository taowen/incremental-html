import { morph, morphChildNodes, morphInnerHTML } from '@incremental-html/morph';
import { computed, ComputedRef, effect, isRef, ReactiveEffectRunner } from '@vue/reactivity';
import { copyFrom } from './copyFrom';
import { callEventHandlerAsync, evalExpr } from './eval';
import { Feature } from './Feature';
import { camelize } from './naming';
import { notifyNodeSubscribers } from './subscribeNode';

let nextId = 1;

export function startDomObserver() {
    return mountNode(document.body);
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
    return unmountNode(el);
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
                mountNode(addedNode as Element);
            }
        }
        for (let i = 0; i < mutation.removedNodes.length; i++) {
            const removedNode = mutation.removedNodes.item(i) as Element;
            if (!removedNode.parentNode && removedNode.nodeType === 1) {
                unmountNode(removedNode);
            }
        }
    }
    if (toNotify) {
        for (const xid of toNotify) {
            notifyNodeSubscribers(xid);
        }
    }
});

function unmountNode(element: Element): Promise<void> | void {
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
    if (promises.length === 0) {
        return undefined;
    } else if (promises.length === 1) {
        return promises[0];
    } else {
        return Promise.all(promises) as any;
    }
}

function mountNode(node: Element) {
    if ((node as any).$xid) {
        return (node as any).$xid;
    }
    const xid = `n${nextId++}`;
    (node as any).$xid = xid;
    if (node.tagName === 'TEMPLATE') {
        return;
    }
    const copyFromSelector = node.getAttribute('copy-from');
    if (copyFromSelector) {
        const template = document.querySelector(copyFromSelector);
        if (template) {
            node.removeAttribute('copy-from');
            copyFrom(node, template as HTMLTemplateElement);
        } else {
            console.error(`copy-from ${copyFromSelector} not found`);
        }
    }
    if (node.tagName === 'INPUT') {
        node.addEventListener('input', () => {
            const ref = (node as any).$valueRef;
            if (ref) {
                ref.value = (node as HTMLInputElement).value;
            }
            notifyNodeSubscribers(xid);
        });
        const superProps = Object.getPrototypeOf(node);
        const superSet = Object.getOwnPropertyDescriptor(superProps, "value")!.set!;
        const superGet = Object.getOwnPropertyDescriptor(superProps, "value")!.get!;
        Object.defineProperty(node, "value", {
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
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name.startsWith('on:')) {
            const eventName = attr.name.substring('on:'.length);
            node.addEventListener(eventName, (...args) => {
                const [event] = args;
                event.preventDefault();
                event.stopPropagation();
                callEventHandlerAsync(node, eventName, ...args);
            })
        } else if (attr.name.startsWith('prop:')) {
            let computedProps = (node as any).$computedProps;
            if (!computedProps) {
                (node as any).$computedProps = computedProps = {};
            }
            const propName = camelize(attr.name.substring('prop:'.length));
            const computedProp = computed(() => {
                let value = undefined;
                try {
                    value = evalExpr(attr.value, node);
                } catch (e) {
                    console.error(`failed to eval ${attr.name} of `, node, e);
                }
                return value;
            });
            computedProps[propName] = computedProp;
            if (isExistingProp(node, propName)) {
                // existing DOM node property, make a data binding here
                let bindings = (node as any).$bindings;
                if (!bindings) {
                    (node as any).$bindings = bindings = {};
                }
                bindings[propName] = effect(() => {
                    computedProp.value; // subscribe
                    markDirty(node, propName); // delay the actual DOM changes to next tick
                });
            } else {
                // define new property
                Object.defineProperty(node, propName, {
                    enumerable: true,
                    get() {
                        return computedProp.value;
                    }
                })
            }
        } else if (attr.name.startsWith('use:')) {
            let featureClass = evalExpr(attr.value, node);
            const featureName = attr.name.substring('use:'.length);
            createFeature(featureClass, node, featureName);
        }
    }
    for (let i = 0; i < node.children.length; i++) {
        mountNode(node.children[i])
    }
    mutationObserver.observe(node, {
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