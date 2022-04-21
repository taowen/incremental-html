import { sendFormErrors } from "./sendFormErrors";

export type NewForm<T> = { [P in keyof T]: NewForm<T[P]> } & {
    nameOf(field: keyof T): string;
    idOf(field: keyof T): string;
    idAndNameOf(field: keyof T): { id: string, name: string }
}

export function createForm<T extends Object>(fields: T, idPrefix?: string): NewForm<T> {
    return createFormObject(fields, [idPrefix || '']);
}

function createFormObject(fields: any, prefix: (string | number)[]): any {
    if (typeof fields !== 'object') {
        return fields;
    }
    if (fields === null) {
        return null;
    }
    if (Array.isArray(fields)) {
        return fields.map((field, index) => createFormObject(field, [...prefix, index]))
    }
    const formObject: any = new FormObject(prefix);
    for (const [k, v] of Object.entries(fields)) {
        formObject[k] = createFormObject(v, [...prefix, k]);
    }
    return formObject;
}

class FormObject {
    constructor(private _prefix: (string | number)[]) {
    }

    public nameOf(field: string) {
        const path = [...this._prefix, field];
        let parts: string[] = [path[1] as string];
        for (let i = 2; i < path.length; i++) {
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

    public idOf(field: string) {
        if ((this as any).id) {
            return `${(this as any).id}-${field}`;
        }
        const path = [...this._prefix.map(p => typeof p === 'number' ? p.toString() : p), field];
        return path[0] ? path.join('-') : path.slice(1).join('-');
    }

    public idAndNameOf(field: string) {
        return { id: this.idOf(field), name: this.nameOf(field) }
    }

    public setError(field: string, errorMessage: string) {
        (this as any)[`${field}_ERROR`] = errorMessage;
    }

    public getError(field: string) {
        return (this as any)[`${field}_ERROR`];
    }

    public dumpErrors(): Record<string, string> | undefined {
        const errors: Record<string, string> = {};
        for (const [k, v] of Object.entries((this as any))) {
            if (k.endsWith('_ERROR')) {
                errors[this.nameOf(k.substring(0, k.length - '_ERROR'.length))] = v as any;
                continue;
            } 
            if (v instanceof FormObject) {
                Object.assign(errors, v.dumpErrors());
            }
        }
        if (Object.keys(errors).length === 0) {
            return undefined;
        }
        return errors;
    }

    public sendErrors(resp: any, errorMessage: string) {
        const formErrors = this.dumpErrors();
        if (formErrors) {
            sendFormErrors(resp, { errorMessage, formErrors });
        }
        return !!formErrors;
    }

    public toJSON() {
        return {...this, _prefix: undefined}
    }
}
