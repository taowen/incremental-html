import { render } from "../render";

test('simple render is just clone', () => {
    const template = document.createElement('template');
    template.innerHTML = '<div>a</div><span>b</span>';
    const rendered = render(template) as HTMLElement[];
    expect(rendered.length).toBe(2);
    expect(rendered[0].tagName).toBe('DIV')
    expect(rendered[1].tagName).toBe('SPAN')
})

test('top level render:if', () => {
    const template = document.createElement('template');
    template.innerHTML = '<div render:if="false">a</div>';
    const rendered = render(template) as HTMLElement[];
    expect(rendered.length).toBe(0);
})

test('element child render:if', () => {
    const template = document.createElement('template');
    template.innerHTML = '<div><div render:if="false">a</div></div>';
    const rendered = render(template) as HTMLElement[];
    expect(rendered.length).toBe(1);
    expect(rendered[0].childNodes.length).toBe(0)
})

test('render:if attribute should be removed', () => {
    const template = document.createElement('template');
    template.innerHTML = '<div render:if="true">a</div>';
    const rendered = render(template) as HTMLElement[];
    expect(rendered.length).toBe(1);
    expect(rendered[0].getAttribute('render:if')).toBeNull();
})

test('render:inner-html should appendChild', () => {
    const template = document.createElement('template');
    template.innerHTML = `<div render:inner-html="[document.createElement('div')]"></div>`;
    const rendered = render(template) as HTMLElement[];
    expect(rendered[0].innerHTML).toBe('<div></div>');
})

test('render:inner-html should flattern array', () => {
    const template = document.createElement('template');
    template.innerHTML = `<div render:inner-html="[[[document.createElement('div')]]]"></div>`;
    const rendered = render(template) as HTMLElement[];
    expect(rendered[0].innerHTML).toBe('<div></div>');
})

test('render:inner-html should support html', () => {
    const template = document.createElement('template');
    template.innerHTML = `<div render:inner-html="'<div></div>'"></div>`;
    const rendered = render(template) as HTMLElement[];
    expect(rendered[0].innerHTML).toBe('<div></div>');
})

test('render:id can set id', () => {
    const template = document.createElement('template');
    template.innerHTML = `<div render:id="'hello'"></div>`;
    const rendered = render(template) as HTMLElement[];
    expect(rendered[0].id).toBe('hello');
})