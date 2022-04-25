import { morphChildNodes } from "../src/morphChildNodes";

test('add child to tail', () => {
    const oldEl = document.createElement('div');
    const newEl = document.createElement('div');
    newEl.innerHTML = `<p>hello</p>`
    morphChildNodes(oldEl, newEl);
    expect(oldEl.innerHTML).toEqual('<p>hello</p>');
})

test('remove extra child while keep same id element', () => {
    const oldEl = document.createElement('div');
    oldEl.innerHTML = `<p></p><p id="blah">hello</p>`
    const oldChild = oldEl.lastChild;
    (oldChild as any).$prop = 'abc'
    const newEl = document.createElement('div');
    newEl.innerHTML = `<p id="blah">hello</p>`
    morphChildNodes(oldEl, newEl);
    expect(oldEl.innerHTML).toEqual('<p id="blah">hello</p>');
    expect((oldEl.firstChild as any).$prop).toBe('abc');
})

test('morph old node', () => {
    const oldEl = document.createElement('div');
    oldEl.innerHTML = `<p>hello</p>`
    const newEl = document.createElement('div');
    newEl.innerHTML = `<p>world</p>`
    morphChildNodes(oldEl, newEl);
    expect(oldEl.innerHTML).toEqual('<p>world</p>');
})