export async function submitForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const resp = await fetch(form.action, {
        method: form.method,
        body: new URLSearchParams(formData as any)
    })
    if (resp.status === 422) {
        const { errorMessage, formErrors } = await resp.json();
        form.setAttribute('error', errorMessage);
        for (const [k, v] of Object.entries(formErrors)) {
            const input = form.querySelector(`[name="${k}"]`);
            if (input) {
                input.setAttribute('error', v as string);
            }
        }
        return undefined;
    }
    return resp;
}