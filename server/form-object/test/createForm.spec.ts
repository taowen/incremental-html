import { createForm } from "../src/createForm";

test('nameOf one level', () => {
    const formObject = createForm({ email: 'taowen@gmail.com' });
    expect(formObject.email).toBe('taowen@gmail.com');
    expect(formObject.nameOf('email')).toBe('email');
    expect(formObject.idOf('email')).toBe('email');
})

test('nameOf indexed by number', () => {
    const formObject = createForm({ emails: [{ primary: 'taowen@gmail.com' }] });
    expect(formObject.emails[0].primary).toBe('taowen@gmail.com');
    expect(formObject.emails[0].nameOf('primary')).toBe('emails[0].primary');
    expect(formObject.emails[0].idOf('primary')).toBe('emails-0-primary');
})

test('nameOf indexed by string', () => {
    const formObject = createForm({ country: {} } as any, 'form1');
    expect(formObject.country.province).toBe(undefined);
    expect(formObject.country.nameOf('province')).toBe('country.province');
    expect(formObject.country.idOf('province')).toBe('form1-country-province');
})

test('array is still array', () => {
    const formObject = createForm({ emails: [{ primary: 'taowen@gmail.com' }] });
    expect(formObject.emails.map(email => email.primary)).toEqual(['taowen@gmail.com']);
})