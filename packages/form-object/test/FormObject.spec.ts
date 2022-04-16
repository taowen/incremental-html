import { FormObject } from "../src/FormObject"

test('nameOf one level', () => {
    const formObject = FormObject.fromObject({ email: 'taowen@gmail.com' });
    expect(formObject.email).toBe('taowen@gmail.com');
    expect(formObject.nameOf('email')).toBe('email');
})

test('nameOf indexed by number', () => {
    const formObject = FormObject.fromObject({ emails: ['taowen@gmail.com'] });
    expect(formObject.emails[0]).toBe('taowen@gmail.com');
    expect(formObject.emails.nameOf(0)).toBe('emails[0]');
})

test('nameOf indexed by string', () => {
    const formObject = FormObject.fromObject({} as any);
    expect(formObject.country.province).toBe(undefined);
    expect(formObject.country.nameOf('province')).toBe('country.province');
})