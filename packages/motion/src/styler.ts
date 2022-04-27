import styler, { Styler } from "stylefire";

export function getStyle(element: Element, key: string, forceRead?: boolean): any {
    let stylerObject: Styler = Reflect.get(element, 'stylerObject');
    if (!stylerObject) {
        Reflect.set(element, 'stylerObject', stylerObject = styler(element))
    }
    return stylerObject.get(key, forceRead);
}

type ResolvedState = {
    [key: string]: string | number;
};
type CustomTemplate = (state: ResolvedState, prebuilt: string) => string;
type State = {
    [key: string]: string | number | CustomTemplate | undefined;
};

export function setStyle(element: Element, key: string | State, value?: any) {
    let stylerObject: Styler = Reflect.get(element, 'stylerObject');
    if (!stylerObject) {
        Reflect.set(element, 'stylerObject', stylerObject = styler(element))
    }
    return stylerObject.set(key, value)
}