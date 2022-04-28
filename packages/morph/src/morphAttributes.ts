export function morphAttributes(oldEl: Element, newEl: Element) {
    const oldAttrs = oldEl.getAttributeNames();
    for (let i = 0; i < newEl.attributes.length; i++) {
        const attr = newEl.attributes.item(i)!;
        if (attr.name === 'style') {
            const oldStyle = oldEl.getAttribute('style')||'';
            oldEl.setAttribute(attr.name, oldStyle.replace(attr.value, '') + ' ' + attr.value);
        } else if ((oldEl as HTMLElement).tagName === 'INPUT' && attr.name === 'value') {
            // ignore
        }  else if ((oldEl as HTMLElement).tagName === 'INPUT' && attr.name === 'checked') {
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