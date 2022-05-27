declare const global: any;

let evalGlobals = (() => {
    if (typeof window !== 'undefined') {
        return (window as any).$evalGlobals = (window as any).$evalGlobals || {
            globalKeys: [] as string[],
            globalValues: [] as any[]
        }
    }
    if (typeof global !== 'undefined') {
        return (global as any).$evalGlobals = (global as any).$evalGlobals || {
            globalKeys: [] as string[],
            globalValues: [] as any[]
        }
    }
    return {
        globalKeys: [] as string[],
        globalValues: [] as any[]
    }
})();

export function setEvalGlobals(kv: Record<string, any>) {
    for (const [k, v] of Object.entries(kv)) {
        if (k.startsWith('$')) {
            evalGlobals.globalKeys.push(k);
        } else {
            evalGlobals.globalKeys.push(`$${k}`);
        }
        evalGlobals.globalValues.push(v);
    }
}

export function evalExpr(expr: string, theThis?: any, ...args: any[]) {
    const syncEvaluator = Function.apply(null, [...evalGlobals.globalKeys, 'expr', 'arguments', "return eval('expr = undefined;' + expr)"]);
    return syncEvaluator.apply(theThis, [...evalGlobals.globalValues, expr.includes(';') ? expr : `(${expr})`, args]);
}

function evalAsync(expr: string, theThis?: any, ...args: any[]) {
    const asyncEvaluator = Function.apply(null, [...evalGlobals.globalKeys, 'expr', 'event', 'arguments', "return eval('expr = undefined; (async() => {' + expr + '})();')"]);
    return asyncEvaluator.apply(theThis, [...evalGlobals.globalValues, expr, args[0], args]);
}

export async function callEventHandlerAsync(node: Element, eventName: string, ...args: any[]) {
    try {
        return await evalAsync(node.getAttribute(`on:${eventName}`)!, node, ...args);
    } catch (e) {
        if (node.dispatchEvent(new Event('event-handler-error', { cancelable: true,  bubbles: true }))) {
            console.error('failed to handle ' + eventName, { e });
        }
        return undefined;
    }
}

function evalSync(expr: string, theThis?: any, ...args: any[]) {
    const syncEvaluator = Function.apply(null, [...evalGlobals.globalKeys, 'expr', 'event', 'arguments', "return eval('expr = undefined;' + expr)"]);
    return syncEvaluator.apply(theThis, [...evalGlobals.globalValues, expr, args[0], args]);
}

export function callEventHandlerSync(node: Element, eventName: string, ...args: any[]) {
    try {
        return evalSync(node.getAttribute(`on:${eventName}`)!, node, ...args);
    } catch (e) {
        console.error('failed to handle ' + eventName, { e });
        return undefined;
    }
}