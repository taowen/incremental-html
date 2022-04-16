export type FormObject<T> = { [P in keyof T]: FormObject<T[P]> } & {
    setError(field: string, errorMessage: string): void;
    getError(field: string): string;
    nameOf(field: string | number): string;
}

export function createForm<T extends Object>(fields: T): FormObject<T> {
    return new Proxy(new FormObjectImpl(fields, []) as any, {
        get(target, p, receiver) {
            const field = target[p];
            if (p === '_prefix') {
                return field;
            }
            if (field === undefined) {
                return new FormObjectImpl({}, [...target._prefix, p]);
            }
            if (typeof field === 'object') {
                return new FormObjectImpl(field, [...target._prefix, p]);
            }
            return field;
        }
    });
}

class FormObjectImpl {
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
