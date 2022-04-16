import { FormObject } from "../src/FormObject"

test('nameOf', () => {
    const formObject = new FormObject({ email: '' });
    expect(formObject.nameOf('email')).toBe('email');
})