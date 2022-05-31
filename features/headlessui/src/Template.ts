import { Feature } from "@incremental-html/reactivity";
import { render } from "@incremental-html/template";

export class Template extends Feature<{}> {
    private template = this.create(() => {
        const template = document.createElement('template');
        let child = this.element.firstChild;
        while (child) {
            template.content.appendChild(child.cloneNode(true));
            child = child.nextSibling;
        }
        this.element.innerHTML = '';
        return template;
    })
    public render(props: Record<string, any>) {
        return render(this.template, props);
    }
}