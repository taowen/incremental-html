import { morphChildNodes } from '@incremental-html/morph';
import { effect, isRef } from '@vue/reactivity';
import { callEventHandler, evalEventHandler, evalSync } from './eval';
import { Feature } from './Feature';
import { camelize } from './naming';
import { refreshNode, setNodeProperty } from './renderTemplate';
import { notifyNodeSubscribers } from './subscribeNode';

let nextId = 1;

const mutationObserver = new MutationObserver((mutationList) => {
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
    for (const feature of Object.values(element)) {
        if (feature instanceof Feature) {
            for (const v of Object.values(feature)) {
                if (v?.onStop) {
                    const promise = v.onStop();
                    if (promise) {
                        promises.push(promise);
                    }
                }
            }
        }
    }
    if (promises.length === 0) {
        return undefined;
    } else {
        return Promise.all(promises) as any;
    }
}

morphChildNodes.beforeRemove = onUnmount;

export function startDomObserver() {
    return mountNode(document.body);
}

export function stopDomObserver() {
    mutationObserver.disconnect();
    delete (document.body as any).$xid;
}

async function mountNode(node: Element) {
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
                callEventHandler(eventName, node, attr.value, ...args);
            })
        } else if (attr.name.startsWith('prop:')) {
            const propName = camelize(attr.name.substring('prop:'.length));
            let value = undefined;
            try {
                value = evalSync(attr.value, node);
            } catch(e) {
                console.error(`failed to eval ${attr.name} of `, node, e);
                continue;
            }
            setNodeProperty(node, propName, value);
        } else if (attr.name.startsWith('use:')) {
            let featureClass = evalSync(attr.value, node);
            const featureName = attr.name.substring('use:'.length);
            const feature = await createFeature(featureClass, node, `${featureName}:`);
            setNodeProperty(node, camelize(featureName), feature);
        }
    }
    effect(() => {
        refreshNode(node);
    })
    for (let i = 0; i < node.children.length; i++) {
        await mountNode(node.children[i])
    }
    mutationObserver.observe(node, {
        attributes: true,
        attributeOldValue: false,
        childList: true,
        subtree: false
    });
    return xid;
}

async function createFeature(featureClass: any, element: Element, prefix: string) {
    if (typeof featureClass !== 'function') {
        throw new Error(`invalid feature class: ${featureClass}`);
    }
    const isSubclassOfFeature = featureClass.prototype.__proto__ === Feature.prototype;
    if (isSubclassOfFeature) {
        return new featureClass(element, prefix);
    }
    const { default: lazyLoadedFeatureClass } = await(featureClass());
    return new lazyLoadedFeatureClass(element);
}