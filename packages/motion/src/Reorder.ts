import { MotionProps, motionValue } from "@incremental-html/framer-motion";
import { Feature, queryFeature } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

export class Reorder extends Feature<MotionProps> {
    public static Group = class extends Feature<{ axis: 'x' | 'y' }> {
    } as any;
    private point = this.create(() => {
        return {
            x: this.props.style?.x || motionValue(0),
            y: this.props.style?.y || motionValue(0)
        };
    })
    private axis = this.create(() => {
        const group: any = queryFeature(this.element, Reorder.Group);
        if (!group) {
            return 'y';
        }
        return group.props.axis;
    })
    private onDrag: MotionProps['onDrag'] = (event, { velocity }) => {
        if (velocity[this.axis]) {
            console.log(this.point[this.axis].get(), velocity[this.axis]);
        }
    }
    private onLayoutMeasure: MotionProps['onLayoutMeasure'] = (measured) => {
    }
    private get mergedProps(): MotionProps {
        const layout = this.props.layout === undefined ? true : this.props.layout;
        return {
            drag: this.axis,
            ...this.props,
            dragSnapToOrigin: true,
            layout,
            style: { ...this.props.style, x: this.point.x, y: this.point.y },
            onDrag: this.onDrag,
            onLayoutMeasure: this.onLayoutMeasure
        }
    }
    private _ = this.onMount(() => {
        const motion = new Motion(this.element, () => this.mergedProps);
        return () => {
            return motion.unmount();
        }
    })
}
