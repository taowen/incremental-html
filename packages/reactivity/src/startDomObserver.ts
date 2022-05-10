import { morph, morphChildNodes, morphInnerHTML } from '@incremental-html/morph';
import { effect, isRef } from '@vue/reactivity';
import { callEventHandlerAsync, evalExpr } from './eval';
import { Feature } from './Feature';
import { camelize } from './naming';
import { setNodeProperty } from './renderTemplate';
import { notifyNodeSubscribers } from './subscribeNode';

let nextId = 1;

morphChildNodes.morphProperties = (oldEl, newEl) => {
    // renderTemplate set $props to new element
    // if old element reused, we need to propagate $props to old element
    (oldEl as any).$props = (newEl as any).$props;
    refreshNode(oldEl);
};

morphChildNodes.beforeRemove = (el) => {
    return onUnmount(el);
};

export const mutationObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
        if (mutation.attributeName === 'style') {
            // avoid animation trigger observer recompute
            continue;
        }
        if (mutation.attributeName) {
            notifyNodeSubscribers((mutation.target as any).$xid);
        }
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            const addedNode = mutation.addedNodes.item(i)!;
            if (addedNode.nodeType === 1) {
                mountNode(addedNode as Element);
            }
        }
        for (let i = 0; i < mutation.removedNodes.length; i++) {
            const removedNode = mutation.removedNodes.item(i) as Element;
            if (!removedNode.parentNode && removedNode.nodeType === 1) {
                onUnmount(removedNode);
            }
        }
    }
});

function onUnmount(element: Element): Promise<void> | void {
    if ((element as any).$unmounted) {
        return;
    }
    (element as any).$unmounted = true;
    const promises = [];
    if ((element as any).$features) {
        for (const feature of (element as any).$features.values()) {
            for (const v of Object.values(feature)) {
                if ((v as any)?.stop) {
                    const promise = (v as any)?.stop();
                    if (promise) {
                        promises.push(promise);
                    }
                }
            }
        }
    }
    if ((element as any).$refreshNode) {
        (element as any).$refreshNode.stop();
    }
    if (promises.length === 0) {
        return undefined;
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
                callEventHandlerAsync(node, eventName, attr.value, ...args);
            })
        } else if (attr.name.startsWith('prop:')) {
            const propName = camelize(attr.name.substring('prop:'.length));
            let value = undefined;
            try {
                value = evalExpr(attr.value, node);
            } catch (e) {
                console.error(`failed to eval ${attr.name} of `, node, e);
                continue;
            }
            setNodeProperty(node, propName, value);
        } else if (attr.name.startsWith('use:')) {
            let featureClass = evalExpr(attr.value, node);
            const featureName = attr.name.substring('use:'.length);
            createFeature(featureClass, node, featureName);
        }
    }
    (node as any).$refreshNode = effect(() => {
        refreshNode(node);
    }).effect;
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

function refreshNode(node: Element) {
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name.startsWith('bind:')) {
            const name = camelize(attr.name.substring('bind:'.length));
            try {
                const newValue = evalExpr(attr.value, node);
                let bindProps = (node as any).$bindProps;
                if (!bindProps) {
                    (node as any).$bindProps = bindProps = {};
                }
                bindProps[name] = newValue;
            } catch (e) {
                console.error(`failed to eval ${attr.name}`, { node, e });
            }
        }
    }
    if ((node as any).$bindProps) {
        applyBindProps(node);
    }
}

async function applyBindProps(node: Element) {
    await new Promise<void>(resolve => resolve());
    const bindProps = (node as any).$bindProps;
    if (!bindProps) {
        return;
    }
    delete (node as any).$bindProps;
    const { innerHtml, childNodes, ...otherBindProps } = bindProps;
    if (Object.keys(otherBindProps).length > 0) {
        morph(node, () => {
            for (const [name, value] of Object.entries(otherBindProps)) {
                setNodeProperty(node, name, value);
            }
        });
    }
    if (innerHtml) {
        morphInnerHTML(node, innerHtml);
    }
    if (childNodes) {
        morphChildNodes(node, Array.isArray(childNodes) ? childNodes : [childNodes]);
    }
}

export function startDomObserver() {
    return mountNode(document.body);
}

export function stopDomObserver() {
    mutationObserver.disconnect();
    delete (document.body as any).$xid;
}
