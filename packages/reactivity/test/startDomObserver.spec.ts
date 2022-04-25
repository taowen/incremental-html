import { startDomObserver, stopDomObserver } from "../src/startDomObserver"
import { renderTemplate } from "../src/renderTemplate"

beforeEach(() => {
    (window as any).$renderTemplate = renderTemplate;
    document.documentElement.innerHTML = '';
    startDomObserver();
})

afterEach(() => {
    stopDomObserver();
    document.documentElement.innerHTML = '';
    delete (window as any).$renderTemplate;
})

test('set textContent', async () => {
    document.body.innerHTML = `<p id="abc" prop:textContent="'hello'"></p>`;
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(document.getElementById('abc')!.textContent).toBe('hello');
})

test('set childNodes', async () => {
    document.body.innerHTML = `
    <template id="myTpl"><p id="abc" prop:textContent="this.$props.text"></p></template>
    <div prop:childNodes="$renderTemplate('#myTpl', { text: 'hello' })"><p id="abc">world</p></div>
    `;
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(document.getElementById('abc')!.textContent).toBe('hello');
})