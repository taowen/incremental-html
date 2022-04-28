import { effect, isRef } from '@vue/reactivity';
import { evalEventHandler, evalSync } from './eval';
import { Feature } from './Feature';
import { camelize, hyphenate } from './naming';
import { refreshNode, setNodeProperty } from './renderTemplate';
import { elementProxy, notifyNodeSubscribers, toRawElement } from './subscribeNode';

let nextId = 1;

const mutationObserver = new MutationObserver((mutationList) => {
    for (const mutation of mutationList) {
        if (mutation.attributeName) {
            notifyNodeSubscribers((mutation.target as any).$xid)
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

function onUnmount(element: Element) {
    for (const feature of Object.values(element)) {
        if (feature instanceof Feature) {
            for (const v of Object.values(feature)) {
                if (v?.onStop) {
                    v.onStop();
                }
            }
        }
    }
}

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
                return superGet.apply(toRawElement(this));
            },
            set: function (t) {
                if (isRef(t)) {
                    this.$valueRef = t;
                    t = t.value;
                } else {
                    delete this.$valueRef;
                }
                superSet.call(toRawElement(this), t);
                notifyNodeSubscribers(xid);
            }
        });
    }
    const proxiedNode = elementProxy(node);
    for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        if (attr.name.startsWith('on:')) {
            const eventName = attr.name.substring('on:'.length);
            node.addEventListener(eventName, (...args) => {
                const [event] = args;
                event.preventDefault();
                event.stopPropagation();
                callEventHandler(eventName, event.target!, attr.value, ...args);
            })
        } else if (attr.name.startsWith('prop:')) {
            const propName = camelize(attr.name.substring('prop:'.length));
            setNodeProperty(node, propName, evalSync(attr.value, proxiedNode));
        } else if (attr.name.startsWith('use:')) {
            let featureClass = evalSync(attr.value, proxiedNode);
            const featureName = attr.name.substring('use:'.length);
            setNodeProperty(node, camelize(featureName), await createFeature(featureClass, proxiedNode));
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

async function createFeature(featureClass: any, element: Element) {
    if (typeof featureClass !== 'function') {
        throw new Error(`invalid feature class: ${featureClass}`);
    }
    if (isAssignableFrom(featureClass, Feature)) {
        return new featureClass(element);
    }
    const { default: lazyLoadedFeatureClass } = await(featureClass());
    return new lazyLoadedFeatureClass(element);
}

function findInPrototype(clazz: any, matcher: (prototype: any) => boolean) {
    if (!(typeof clazz === 'function')) {
        return false;
    }
    let p = clazz.prototype;
    while (p) {
        if (matcher(p)) {
            return true;
        }
        // eslint-disable-next-line no-proto
        p = p.__proto__;
    }
    return false;
}

function isAssignableFrom(subClass: any, superClass: any): boolean {
    if (!(typeof superClass === 'function')) {
        return false;
    }
    if (subClass === superClass) {
        return true;
    }
    return findInPrototype(subClass, p => p === superClass.prototype);
}


async function callEventHandler(eventName: string, node: EventTarget, eventHandler: string | Function, ...args: any[]) {
    try {
        if (typeof eventHandler === 'string') {
            return await evalEventHandler(eventHandler, node, ...args);
        } else {
            return await eventHandler.apply(node, args);
        }
    } catch (e) {
        console.error('failed to handle ' + eventName, { e });
        return undefined;
    }
}

export function queryFeature<T>(element: Element, featureClass: { new (element: Element): T; featureName: string }): T | undefined {
    const featureElement = element.closest(`[use\\:${hyphenate(featureClass.featureName)}]`);
    if (featureElement) {
        const propName = featureClass.featureName.charAt(0).toLowerCase() + featureClass.featureName.slice(1);
        return (featureElement as any)[propName]
    }
    return undefined;
}