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