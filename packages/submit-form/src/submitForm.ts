export async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    await submitForm(e.target as HTMLFormElement);
}

export class ValidationError extends Error { };

export async function submitForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const resp = await fetch(form.action, {
        method: form.method,
        body: formData
    })
    if (resp.status === 422) {
        const { errorMessage, formErrors } = await resp.json();
        throw new ValidationError(errorMessage);
    }
    return resp;
}