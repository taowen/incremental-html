export function renderTemplate(selector: string, props?: Record<string, any>) {
    const templateNode: HTMLTemplateElement = document.querySelector(selector)!;
    if (!templateNode) {
        throw new Error(`template ${selector} not found`);
    }
    return templateNode.content;
}