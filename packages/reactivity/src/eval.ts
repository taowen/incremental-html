export const evalGlobals = {};

export function evalSync(expr: string, theThis?: any, ...args: any[]) {
    const keys = ['expr', 'arguments'];
    const values: any[] = [expr.includes(';') ? expr : `(${expr})`, args];
    for (const [k, v] of Object.entries(evalGlobals)) {
        keys.push(`$${k}`);
        values.push(v);
    }
    const syncEvaluator = Function.apply(null, [...keys, "return eval('expr = undefined;' + expr)"]);
    return syncEvaluator.apply(theThis, values);
}