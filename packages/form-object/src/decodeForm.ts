import { createForm } from "./createForm";

export type SubmittedForm<T> = { [P in keyof T]: SubmittedForm<T[P]> } & {
    setError(field: keyof T, errorMessage: string): void;
    getError(field: keyof T): string;
    dumpErrors(): Record<string, string> | undefined;
    sendErrors(response: any, errorMessage: string): boolean;
}

export function decodeForm<T = any>(encoded: Record<string, string>): SubmittedForm<T> {
    const form = {};
    for (const [path, v] of Object.entries(encoded)) {
        const parts = decodePath(path);
        const container = getContainer(form, parts)
        container[parts[parts.length - 1]] = v;
    }
    return createForm(form) as any;
}

function getContainer(form: any, parts: (string|number)[]) {
    let container = form;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (typeof parts[i+1] === 'number') {
            if (container[part]) {
                container = container[part];
            } else {
                container = container[part] = [];
            }
        } else {
            if (container[part]) {
                container = container[part];
            } else {
                container = container[part] = {};
            }
        }
    }
    return container;
}

function decodePath(path: string) {
    let parts: (string|number)[] = [];
    let part: string[] = [];
    for (const c of path) {
        if (c === '[') {
            if (part.length > 0) {
                parts.push(part.join(''));
            }
            part = [];
        } else if (c === ']') {
            parts.push(parseInt(part.join('')));
            part = [];
        } else if (c === '.') {
            if (part.length > 0) {
                parts.push(part.join(''));
            }
            part = [];
        } else {
            part.push(c);
        }
    }
    if (part.length > 0) {
        parts.push(part.join(''));
    }
    return parts;
}
