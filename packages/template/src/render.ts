export function render(selector: string | HTMLTemplateElement, props?: Record<string, any>): Node[] {
    const template = getTemplate(selector);
    if (!template) {
        throw new Error(`template ${selector} not found`);
    }
    const rendered = [];
    let child = template.content.firstChild;
    while(child) {
        rendered.push(child);
        child = child.nextSibling;
    }
    return rendered;
}

function getTemplate(selector: string | HTMLTemplateElement) {
    if (typeof selector === 'string') {
        return document.querySelector(selector) as HTMLTemplateElement;
    }
    return selector;
}