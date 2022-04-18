export async function submitForm(form: HTMLFormElement) {
    const formData = new FormData(form);
    const resp = await fetch(form.action, {
        method: form.method,
        body: formData
    })
    console.log(await resp.json());
}