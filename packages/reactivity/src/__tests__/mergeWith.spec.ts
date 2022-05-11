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