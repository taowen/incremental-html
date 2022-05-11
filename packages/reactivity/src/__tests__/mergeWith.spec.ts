import { mergeWith } from "../mergeWith";

test('merge top level attributes', () => {
    const template = document.createElement('template');
    template.setAttribute('use:tab', '$Tab');
    const div = document.createElement('div');
    div.setAttribute('style', 'color:red');
    mergeWith(div, template);
    expect(div.outerHTML).toBe('<div style="color:red" use:tab="$Tab"></div>');
})

test('merge child node attributes', () => {
    const template = document.createElement('template');
    template.innerHTML = '<span use:tab="$Tab"></span>';
    const div = document.createElement('div');
    div.innerHTML = '<span></span>';
    mergeWith(div, template);
    expect(div.outerHTML).toBe('<div><span use:tab="$Tab"></span></div>');
})

test('merge grand child node attributes', () => {
    const template = document.createElement('template');
    template.innerHTML = '<span><span use:tab="$Tab"></span></span>';
    const div = document.createElement('div');
    div.innerHTML = '<span><span></span></span>';
    mergeWith(div, template);
    expect(div.outerHTML).toBe('<div><span><span use:tab="$Tab"></span></span></div>');
})

test('insert new node', () => {
    const template = document.createElement('template');
    template.innerHTML = '<span></span><div>hello</div>';
    const div = document.createElement('div');
    div.innerHTML = '<span></span>';
    mergeWith(div, template);
    expect(div.outerHTML).toBe('<div><span></span><div>hello</div></div>');
})