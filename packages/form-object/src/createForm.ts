export type FormObject<T> = { [P in keyof T]: FormObject<T[P]> } & {
    setError(field: keyof T, errorMessage: string): void;
    getError(field: keyof T): string;
    dumpErrors(): Record<string, string>;
    nameOf(field: keyof T): string;
}

export function createForm<T extends Object>(fields: T): FormObject<T> {
    return new Proxy(new FormObjectImpl(fields, []) as any, {
        get(target, p, receiver) {
            const field = target[p];
            if (p === '_prefix') {
                return field;
            }
            if (field instanceof FormObjectImpl) {
                return field;
            }
            if (field === undefined) {
                const subForm = new FormObjectImpl({}, [...target._prefix, p]);
                target[p] = subForm;
                return subForm;
            }
            if (typeof field === 'object') {
                const subForm = new FormObjectImpl(field, [...target._prefix, p]);
                target[p] = subForm;
                return subForm;
            }
            return field;
        }
    });
}

class FormObjectImpl {
    constructor(fields: Record<string, any>, private _prefix: string | number[]) {
        Object.assign(this, fields);
    }

    public nameOf(field: string) {
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

    public setError(field: string, errorMessage: string) {
        (this as any)[`${field}_ERROR`] = errorMessage;
    }

    public getError(field: string) {
        return (this as any)[`${field}_ERROR`];
    }

    public dumpErrors(): Record<string, string> | undefined {
        const errors: Record<string, string> = {};
        for (const [k, v] of Object.entries(this)) {
            if (k.endsWith('_ERROR')) {
                errors[this.nameOf(k.substring(0, k.length - '_ERROR'.length))] = v;
                continue;
            } 
            if (v instanceof FormObjectImpl) {
                Object.assign(errors, v.dumpErrors());
            }
        }
        if (Object.keys(errors).length === 0) {
            return undefined;
        }
        return errors;
    }
}
