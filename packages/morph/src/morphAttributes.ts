export function morphAttributes(oldEl: Element, newEl: Element) {
    const oldAttrs = oldEl.getAttributeNames();
    for (let i = 0; i < newEl.attributes.length; i++) {
        const attr = newEl.attributes.item(i)!;
        if (attr.name === 'style') {
            const oldStyle = oldEl.getAttribute('style') || '';
            oldEl.setAttribute(attr.name, oldStyle.replace(attr.value, '') + ' ' + attr.value);
        } else if (isInputValue((oldEl as HTMLElement).tagName, attr.name)) {
            // ignore
        } else if (oldEl.getAttribute(attr.name) !== attr.value) {
            oldEl.setAttribute(attr.name, attr.value);
        }
        const index = oldAttrs.indexOf(attr.name);
        if (index !== -1) {
            oldAttrs.splice(index, 1);
        }
    }
    for (const attr of oldAttrs) {
        if (attr !== 'style') {
            oldEl.removeAttribute(attr);
        }
    }
}

function isInputValue(tagName: string, attrName: string) {
    if (tagName === 'INPUT' && attrName === 'value') {
        return true;
    } else if (tagName === 'INPUT' && attrName === 'checked') {
        return true;
    } else if (tagName === 'OPTION' && attrName === 'selected') {
        return true;
    }
    return false;
}