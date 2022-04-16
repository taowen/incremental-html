export type AsForm<T> = { [P in keyof T]: AsForm<T[P]> } & {
    addError(field: string, errorMessage: string, details?: any): void;
    clearError(field: string): void;
    listErrors(field: string): { errorMessage: string, details: any }[];
}

export class FormObject {

    public static fromString<T = any>(encoded: string): AsForm<T> {
        throw new Error('not implemented');
    }

    constructor(fields: Record<string, any>) {

    }

    public nameOf(field: string) {
        return field;
    }

    public hasValidationError(): string {
        throw new Error('not implemented');
    }
}
