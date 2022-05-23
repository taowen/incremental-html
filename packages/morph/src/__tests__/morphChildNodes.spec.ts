import { morphChildNodes } from "../morphChildNodes";

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

test('morph reuse nodes', () => {
    const oldEl = document.createElement('div');
    oldEl.innerHTML = `<p id="p1"/><p id="p2"/><p id="p3"/>`;
    (oldEl.querySelector('#p1') as any).$mark = true;
    const newEl = document.createElement('div');
    newEl.innerHTML = `<p id="p2"/><p id="p3">hello</p><p id="p1"/>`
    morphChildNodes(oldEl, newEl);
    expect(oldEl.innerHTML).toEqual('<p id="p2"></p><p id="p3">hello</p><p id="p1"></p>');
    expect((oldEl.querySelector('#p1') as any).$mark).toBeTruthy();
})

test('morph will flattern array', () => {
    const oldEl = document.createElement('div');
    oldEl.innerHTML = `<p>hello</p>`
    morphChildNodes(oldEl, [[document.createElement('p')]] as any);
    expect(oldEl.innerHTML).toEqual('<p></p>');
})