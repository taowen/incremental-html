import { createForm } from "../src/createForm"

test('nameOf one level', () => {
    const formObject = createForm({ email: 'taowen@gmail.com' });
    expect(formObject.email).toBe('taowen@gmail.com');
    expect(formObject.nameOf('email')).toBe('email');
})

test('nameOf indexed by number', () => {
    const formObject = createForm({ emails: ['taowen@gmail.com'] });
    expect(formObject.emails[0]).toBe('taowen@gmail.com');
    expect(formObject.emails.nameOf(0)).toBe('emails[0]');
})

test('nameOf indexed by string', () => {
    const formObject = createForm({} as any);
    expect(formObject.country.province).toBe(undefined);
    expect(formObject.country.nameOf('province')).toBe('country.province');
})

test('setError one level', () => {
    const formObject = createForm({} as any);
    formObject.setError('email', 'required');
    expect(formObject.dumpErrors()).toEqual({
        email: 'required'
    });
})

test('setError in nested form', () => {
    const formObject = createForm({} as any);
    formObject.emails.setError('primary', 'required');
    expect(formObject.dumpErrors()).toEqual({
        ['emails.primary']: 'required'
    });
})