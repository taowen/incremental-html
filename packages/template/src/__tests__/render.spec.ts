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