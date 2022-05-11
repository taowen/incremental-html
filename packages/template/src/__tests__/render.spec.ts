import { render } from "../render"

test('simple render is just clone', () => {
    const template = document.createElement('template');
    template.innerHTML = '<div>a</div><span>b</span>';
    const rendered = render(template) as HTMLElement[];
    expect(rendered.length).toBe(2);
    expect(rendered[0].tagName).toBe('DIV')
    expect(rendered[1].tagName).toBe('SPAN')
})