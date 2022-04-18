export async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    await submitForm(e.target as HTMLFormElement);
}

export async function submitForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const resp = await fetch(form.action, {
        method: form.method,
        body: formData
    })
    console.log(await resp.json());
}