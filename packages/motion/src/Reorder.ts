import { MotionProps } from "@incremental-html/framer-motion";
import { Feature } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

export class Reorder extends Feature<MotionProps> {
    private _ = this.onMount(() => {
        if (!this.element.hasAttribute(`${this.prefix}drag`)) {
            this.element.setAttribute(`${this.prefix}drag`, "'y'");
        }
        this.element.setAttribute(`${this.prefix}drag-snap-to-origin`, '');
        const motion = new Motion(this.element, this.prefix);
        return () => {
            return motion.unmount();
        }
    })
}