import { MotionProps } from "@incremental-html/framer-motion";
import { morph, removeChildNodes } from "@incremental-html/morph";
import { Feature } from "@incremental-html/reactivity";
import { render } from "@incremental-html/template";
import { Motion } from "./Motion";

export class Toast extends Feature<MotionProps & { duration?: number }> {
    public show(props: Record<string, any>) {
        const portal = this.element.parentElement!;
        portal.addEventListener('shouldMorph', (e) => { e.preventDefault(); });
        const toastElements = render(this.element as HTMLTemplateElement, props);
        morph(portal, () => {
            for (const toastElement of toastElements) {
                if (toastElement.nodeType === 1) {
                    new Motion(toastElement as Element, () => this.mergedProps)
                    portal.appendChild(toastElement);
                }
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

    private get mergedProps(): MotionProps {
        return {
            layout: true,
            initial: { opacity: 0, y: 50, scale: 0.3 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: 20, scale: 0.5 },
            ...this.props
        }
    }
}