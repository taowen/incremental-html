import { startDomObserver, stopDomObserver } from "../src/startDomObserver"

beforeEach(() => {
    document.documentElement.innerHTML = '';
    startDomObserver();
})

afterEach(() => {
    stopDomObserver();
    document.documentElement.innerHTML = '';
})

test('set textContent', async () => {
    document.body.innerHTML = `<p id="abc" prop:textContent="'hello'"></p>`;
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(document.getElementById('abc')!.textContent).toBe('hello');
})
