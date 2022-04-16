export type AsForm<T> = { [P in keyof T]: AsForm<T[P]> } & {
    setError(field: string, errorMessage: string): void;
    getError(field: string): string;
    nameOf(field: string | number): string;
}

export class FormObject {

    public static fromString<T = any>(encoded: string): AsForm<T> {
        throw new Error('not implemented');
    }

    public static fromObject<T extends Object>(fields: T): AsForm<T> {
        return new Proxy(new FormObject(fields, []) as any, {
            get(target, p, receiver) {
                const field = target[p];
                if (p === '_prefix') {
                    return field;
                }
                if (field === undefined) {
                    return new FormObject({}, [...target._prefix, p]);
                }
                if (typeof field === 'object') {
                    return new FormObject(field, [...target._prefix, p]);
                }
                return field;
            }
        });
    }

    constructor(fields: Record<string, any>, private _prefix: string | number[]) {
        Object.assign(this, fields);
    }

    public nameOf(field: string | number) {
        const path = [...this._prefix, field];
        let parts: string[] = [path[0] as string];
        for (let i = 1; i < path.length; i++) {
            const part = path[i];
            if (typeof part === 'number') {
                parts.push('[');
                parts.push(part.toString());
                parts.push(']');
            } else {
                parts.push('.');
                parts.push(part);
            }
        }
        return parts.join('');
    }

    public hasValidationError(): string {
        throw new Error('not implemented');
    }
}
