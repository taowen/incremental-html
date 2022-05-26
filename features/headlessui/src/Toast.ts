import { morph, removeChildNodes } from "@incremental-html/morph";
import { Feature } from "@incremental-html/reactivity";
import { render } from "@incremental-html/template";

export class Toast extends Feature<{ duration?: number }> {
    public show(props: Record<string, any>) {
        const portal = this.element.parentElement!;
        const toastElements = render(this.element as HTMLTemplateElement, props);
        morph(portal, () => {
            for (const toastElement of toastElements) {
                portal.appendChild(toastElement);
            }
        })
        const control = {
            hide: () => {
                removeChildNodes(portal, toastElements);
            }
        }
        setTimeout(control.hide, this.props.duration || 1000);
        return control;
    }
}