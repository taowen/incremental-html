// send 422 Unprocessable Entity status code
// submitForm will bind the errors to DOM
export function sendFormErrors(resp: any, data: {
    errorMessage: string,
    formErrors: Record<string, string>
}) {
    resp.status(422).send(JSON.stringify(data));
}