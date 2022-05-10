let globalKeys: string[] = [];
let globalValues: any[] = [];

export function setEvalGlobals(evalGlobals: Record<string, any>) {
    globalKeys = [];
    globalValues = [];
    for (const [k, v] of Object.entries(evalGlobals)) {
        if (k.startsWith('$')) {
            globalKeys.push(k);
        } else {
            globalKeys.push(`$${k}`);
        }
        globalValues.push(v);
    }
}

export function evalExpr(expr: string, theThis?: any, ...args: any[]) {
    const syncEvaluator = Function.apply(null, [...globalKeys, 'expr', 'arguments', "return eval('expr = undefined;' + expr)"]);
    return syncEvaluator.apply(theThis, [...globalValues, expr.includes(';') ? expr : `(${expr})`, args]);
}

function evalAsync(expr: string, theThis?: any, ...args: any[]) {
    const asyncEvaluator = Function.apply(null, [...globalKeys, 'expr', 'event', 'arguments', "return eval('expr = undefined; (async() => {' + expr + '})();')"]);
    return asyncEvaluator.apply(theThis, [...globalValues, expr, args[0], args]);
}

export async function callEventHandlerAsync(node: Element, eventName: string, ...args: any[]) {
    try {
        return await evalAsync(node.getAttribute(`on:${eventName}`)!, node, ...args);
    } catch (e) {
        console.error('failed to handle ' + eventName, { e });
        return undefined;
    }
}

function evalSync(expr: string, theThis?: any, ...args: any[]) {
    const syncEvaluator = Function.apply(null, [...globalKeys, 'expr', 'event', 'arguments', "return eval('expr = undefined;' + expr)"]);
    return syncEvaluator.apply(theThis, [...globalValues, expr, args[0], args]);
}

export function callEventHandlerSync(node: Element, eventName: string, ...args: any[]) {
    try {
        return evalSync(node.getAttribute(`on:${eventName}`)!, node, ...args);
    } catch (e) {
        console.error('failed to handle ' + eventName, { e });
        return undefined;
    }
}