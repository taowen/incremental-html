import { morph, morphAttributes, morphChildNodes, morphInnerHTML } from '@incremental-html/morph';
import { computed, ComputedRef, effect, ReactiveEffectRunner } from '@vue/reactivity';
import { copyFrom } from './copyFrom';
import { callEventHandlerAsync, evalExpr } from './eval';
import { Feature } from './Feature';
import { camelize } from './naming';

let nextId = 1;

export function startDomObserver(root?: Element) {
    return mountElement(root || document.body);
}

export function stopDomObserver(root?: Element) {
    mutationObserver.disconnect();
    delete (root || document.body as any).$xid;
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
    // unmount before DOM node removal, so that exit animation can be played
    return unmountElement(el);
};

export const mutationObserver: MutationObserver = typeof MutationObserver === 'undefined' ? undefined as any : new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
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
});

export function unmountElement(element: Element): Promise<void> | void {
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
        const features: Map<any, Feature<any>> = (element as any).$features;
        for (const feature of features.values()) {
            const promise = feature.__unmount__();
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

export function mountElement(element: Element) {
    if ((element as any).$xid) {
        return (element as any).$xid;
    }
    const xid = `n${nextId++}`;
    (element as any).$xid = xid;
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
        } else if (attr.name.startsWith('attr:')) {
            const attrName = camelize(attr.name.substring('attr:'.length));
            let bindings = (element as any).$bindings;
            if (!bindings) {
                (element as any).$bindings = bindings = {};
            }
            bindings[attrName] = effect(() => {
                try {
                    const value = evalExpr(attr.value, element);
                    scheduleAttrChange(element, attrName, value);
                } catch (e) {
                    console.error(`failed to eval ${attr.name} of `, element, e);
                }
            });
        } else if (attr.name.startsWith('prop:')) {
            const propName = camelize(attr.name.substring('prop:'.length));
            mountElementProp(element, propName, attr);
        } else if (attr.name.startsWith('display:')) {
            mountElementPropBinding(element, attr.name, attr);
        } else if (attr.name.startsWith('style:')) {
            mountElementPropBinding(element, attr.name, attr);
        } else if (attr.name.startsWith('use:')) {
            let featureClass = evalExpr(attr.value, element);
            const featureName = attr.name.substring('use:'.length);
            const feature = new featureClass(element, `${featureName}:`);
            setNodeProperty(element, camelize(featureName), feature);
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
    element.removeAttribute('use-cloak');
    return xid;
}

function mountElementProp(element: Element, propName: string, attr: Attr) {
    if (isExistingProp(element, propName)) {
        mountElementPropBinding(element, propName, attr);
    } else {
        let computedProps = (element as any).$computedProps;
        if (!computedProps) {
            (element as any).$computedProps = computedProps = {};
        }
        const computedProp = computed(() => {
            try {
                return evalExpr(attr.value, element);
            } catch (e) {
                console.error(`failed to eval ${attr.name} of `, element, e);
            }
        });
        computedProps[propName] = computedProp;
        Object.defineProperty(element, propName, {
            enumerable: true,
            get() {
                return computedProp.value;
            }
        })
    }
}

function mountElementPropBinding(element: Element, propName: string, attr: Attr) {
    if (propName === 'textContent' || propName === 'innerHtml' || propName === 'childNodes') {
        element.addEventListener('shouldMorph', (e) => { e.preventDefault() });
    }
    let bindings = (element as any).$bindings;
    if (!bindings) {
        (element as any).$bindings = bindings = {};
    }
    bindings[propName] = effect(() => {
        try {
            const value = evalExpr(attr.value, element);
            schedulePropChange(element, propName, value);
        } catch (e) {
            console.error(`failed to eval ${attr.name} of `, element, e);
        }
    });
}

function isExistingProp(obj: any, propName: string): any {
    if (propName === 'innerHtml' || propName === 'class') {
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

let scheduler: { current: Promise<void> | undefined } = { current: undefined };
const dirtyElements = new Set<Element>();

export function schedulePropChange(element: Element, propName: string, propValue: any) {
    let dirtyProps = (element as any).$dirtyProps;
    if (!dirtyProps) {
        (element as any).$dirtyProps = dirtyProps = new Map<string, any>();
    }
    dirtyProps.set(propName, propValue);
    dirtyElements.add(element);
    schedule();
}

export function scheduleAttrChange(element: Element, attrName: string, attrValue: string) {
    let dirtyAttrs = (element as any).$dirtyAttrs;
    if (!dirtyAttrs) {
        (element as any).$dirtyAttrs = dirtyAttrs = new Map<string, string>();
    }
    dirtyAttrs.set(attrName, attrValue);
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
        const dirtyProps: Map<string, any> = (el as any).$dirtyProps;
        if (dirtyProps && dirtyProps.size > 0) {
            morph(el, () => {
                for (const [propName, propValue] of dirtyProps.entries()) {
                    setNodeProperty(el, propName, propValue);
                }
            })
            dirtyProps.clear();
        }
        const dirtyAttrs: Map<string, string> = (el as any).$dirtyAttrs;
        if (dirtyAttrs && dirtyAttrs.size > 0) {
            morph(el, () => {
                for (const [attrName, attrValue] of dirtyAttrs.entries()) {
                    el.setAttribute(attrName, attrValue);
                }
            })
            dirtyAttrs.clear();
        }
    }
}

export function nextTick(): Promise<void> {
    return schedule();
}

function setNodeProperty(node: Element, name: string, value: any) {
    if (name.startsWith('display:')) {
        (node as HTMLElement).style.display = value ? name.substring('display:'.length) : 'none';
        return;
    }
    if (name.startsWith('style:')) {
        Reflect.set((node as HTMLElement).style, name.substring('style:'.length), value)
        return;
    }
    if (name === 'class') {
        if (typeof value === 'object') {
            const classes = node.className.split(' ').filter(c => !!c);
            for (const [itemClass, itemEnabled] of Object.entries(value)) {
                if (itemEnabled && !classes.includes(itemClass)) {
                    classes.push(itemClass);
                } else if (!itemEnabled && classes.includes(itemClass)) {
                    classes.splice(classes.indexOf(itemClass), 1);
                }
            }
            node.className = classes.join(' ');
        } else {
            node.className = value;
        }
        return;
    }
    if (name === 'innerHtml') {
        morphInnerHTML(node, value);
        return;
    }
    if (name === 'attributes') {
        morphAttributes(node, value);
        return;
    }
    Reflect.set(node, name, value);
}