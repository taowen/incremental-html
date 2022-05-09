let globalKeys: string[] = [];
let globalValues: any[] = [];

export function evalSync(expr: string, theThis?: any, ...args: any[]) {
    const syncEvaluator = Function.apply(null, [...globalKeys, 'expr', 'arguments', "return eval('expr = undefined;' + expr)"]);
    return syncEvaluator.apply(theThis, [...globalValues, expr.includes(';') ? expr : `(${expr})`, args]);
}

export function evalEventHandler(expr: string, theThis?: any, ...args: any[]) {
    const asyncEvaluator = Function.apply(null, [...globalKeys, 'expr', 'event', 'arguments', "return eval('expr = undefined; (async() => {' + expr + '})();')"]);
    return asyncEvaluator.apply(theThis, [...globalValues, expr, args[0], args]);
}

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

export async function callEventHandler(eventName: string, node: EventTarget, eventHandler: string | Function, ...args: any[]) {
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