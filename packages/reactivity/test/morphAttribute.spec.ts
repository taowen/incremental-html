import { morphAttributes } from "../src/morphAttributes";

test('added attribute', () => {
    const oldEl = document.createElement('div');
    const newEl = document.createElement('div');
    newEl.setAttribute('title', 'hello');
    morphAttributes(oldEl, newEl);
    expect(oldEl.getAttributeNames()).toEqual(['title']);
})

test('removed attribute', () => {
    const oldEl = document.createElement('div');
    oldEl.setAttribute('title', 'hello');
    const newEl = document.createElement('div');
    morphAttributes(oldEl, newEl);
    expect(oldEl.getAttributeNames()).toEqual([]);
})

test('modified attribute', () => {
    const oldEl = document.createElement('div');
    oldEl.setAttribute('title', 'hello');
    const newEl = document.createElement('div');
    newEl.setAttribute('title', 'world');
    morphAttributes(oldEl, newEl);
    expect(oldEl.getAttributeNames()).toEqual(['title']);
    expect(oldEl.getAttribute('title')).toEqual('world');
})

test('modified style', () => {
    const oldEl = document.createElement('div');
    oldEl.style.color = 'black';
    oldEl.style.fontSize = 'larger';
    const newEl = document.createElement('div');
    newEl.setAttribute('style', 'color:red');
    morphAttributes(oldEl, newEl);
    expect(oldEl.getAttribute('style')).toEqual('color: black; font-size: larger; color:red');
})