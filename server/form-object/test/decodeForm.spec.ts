import { decodeForm } from "../src/decodeForm"

test('decode one level', () => {
    const form = decodeForm({
        email: 'taowen@gmail.com'
    });
    expect(form.email).toBe('taowen@gmail.com');
})

test('decode indexed by number', () => {
    const form = decodeForm({
        'emails[0]': 'taowen@gmail.com'
    });
    expect(form.emails[0]).toBe('taowen@gmail.com');
})

test('decode indexed by string', () => {
    const form = decodeForm({
        'emails[0].primary': 'taowen@gmail.com'
    });
    expect(form.emails[0].primary).toBe('taowen@gmail.com');
})

test('decode double array', () => {
    const form = decodeForm({
        'emails[0][1]': 'taowen@gmail.com',
        'emails[0][0]': 'example@example.com'
    });
    expect(form.emails[0][1]).toBe('taowen@gmail.com');
    expect(form.emails[0][0]).toBe('example@example.com');
})

test('setError one level', () => {
    const formObject = decodeForm({} as any);
    formObject.setError('email', 'required');
    expect(formObject.dumpErrors()).toEqual({
        email: 'required'
    });
})

test('setError in nested form', () => {
    const formObject = decodeForm({ emails: {} } as any);
    formObject.emails.setError('primary', 'required');
    expect(formObject.dumpErrors()).toEqual({
        ['emails.primary']: 'required'
    });
})