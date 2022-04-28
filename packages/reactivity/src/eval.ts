const syncEvaluator = Function.apply(null, ['expr', 'arguments', "return eval('expr = undefined;' + expr)"]);
export function evalSync(expr: string, theThis?: any, ...args: any[]) {
    return syncEvaluator.apply(theThis, [expr.includes(';') ? expr : `(${expr})`, args]);
}