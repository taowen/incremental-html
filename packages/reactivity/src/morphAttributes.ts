export function morphAttributes(oldEl: HTMLElement, newEl: HTMLElement) {
    const oldAttrs = oldEl.getAttributeNames();
    for (let i = 0; i < newEl.attributes.length; i++) {
        const attr = newEl.attributes.item(i)!;
        if (attr.name === 'style') {
            oldEl.setAttribute(attr.name, `${oldEl.getAttribute('style')||''} ${attr.value}`);
        } else {
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