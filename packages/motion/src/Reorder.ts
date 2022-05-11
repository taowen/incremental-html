import { MotionProps } from "@incremental-html/framer-motion";
import { Feature } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

export class Reorder extends Feature<MotionProps> {
    private _ = this.onMount(() => {
        const motion = new Motion(this.element, () => this.mergedProps);
        return () => {
            return motion.unmount();
        }
    })
    private get mergedProps(): MotionProps {
        return { drag: 'y', ...this.props, dragSnapToOrigin: true }
    }
}