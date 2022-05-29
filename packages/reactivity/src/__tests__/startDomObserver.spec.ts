import { ref } from "@vue/reactivity";
import { setEvalGlobals } from "../eval";
import { nextTick, startDomObserver, stopDomObserver } from "../startDomObserver";

beforeEach(() => {
    document.documentElement.innerHTML = '';
    startDomObserver();
})

afterEach(() => {
    stopDomObserver();
    document.documentElement.innerHTML = '';
})

test('set textContent', async () => {
    document.body.innerHTML = `<p id="abc" prop:text-content="'hello'"></p>`;
    await nextTick();
    expect(document.getElementById('abc')!.textContent).toBe('hello');
})

test('set display conditionally', async () => {
    document.body.innerHTML = `<p id="abc" display:block="true"></p>`;
    await nextTick();
    expect(document.getElementById('abc')!.style.display).toBe('block');
    document.body.innerHTML = `<p id="abc" display:block="false"></p>`;
    await nextTick();
    expect(document.getElementById('abc')!.style.display).toBe('none');
})

test('set style partially', async () => {
    document.body.innerHTML = `<p id="abc" style:color="'red'"></p>`;
    await nextTick();
    expect(document.getElementById('abc')!.style.color).toBe('red');
})

test('set class partially', async () => {
    document.body.innerHTML = `<p id="abc" class="fixed" prop:class="{ 'ml-4': true, 'mt-4': false }"></p>`;
    await nextTick();
    expect(document.getElementById('abc')!.className).toBe('fixed ml-4');
})

test('copy from', async () => {
    document.body.innerHTML = `<template id="tpl1" title="hello"></template><p copy-from="#tpl1"></p>`;
    await nextTick();
    expect(document.querySelector('p')!.outerHTML).toBe('<p title="hello"></p>');
})

test('can update dom existing property on change', async () => {
    setEvalGlobals({ ref })
    document.body.innerHTML = `<p id="abc" prop:text-ref="$ref('hello')" prop:text-content="this.textRef.value"></p>`;
    await nextTick();
    const el = document.getElementById('abc')!;
    expect(el.textContent).toBe('hello');
    (el as any).textRef.value = 'world';
    await nextTick();
    expect(el.textContent).toBe('world');
    document.body.innerHTML = ''; // unmount
    await nextTick();
    (el as any).textRef.value = '~~~';
    await nextTick();
    expect(el.textContent).toBe('world');
})