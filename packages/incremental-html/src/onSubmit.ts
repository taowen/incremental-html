export async function onSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form)
    const result = await fetch(form.action, {
        method: form.method,
        body: formData
    });
    console.log('!!!', result);
}