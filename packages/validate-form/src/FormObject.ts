type FormObjectType<T> = { [P in keyof T]: FormObjectType<T[P]> } & {
    addError(field: string, errorMessage: string, details?: any): void;
    clearError(field: string): void;
    listErrors(field: string): { errorMessage: string, details: any }[];
}

export class FormObject {
    public static fromString<T = any>(encoded: string): FormObjectType<T> {
        throw new Error('not implemented');
    }

    public hasValidationError(): string {
        throw new Error('not implemented');
    }
}