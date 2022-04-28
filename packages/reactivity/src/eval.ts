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
        globalKeys.push(`$${k}`);
        globalValues.push(v);
    }
}