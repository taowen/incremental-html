/// <reference path="./jsx.d.ts" />
export * from './dist/esm/index';

declare global {
  namespace JSX {
    interface Element { }
    interface ElementClass {
      $props: {}
    }
    interface ElementAttributesProperty {
      $props: {}
    }
    interface IntrinsicElements extends JsxToHtml.NativeElements {
      // allow arbitrary elements
      // @ts-ignore suppress ts:2374 = Duplicate string index signature.
      [name: string]: any
    }
    interface IntrinsicAttributes extends JsxToHtml.ReservedProps { }
  }
}