import { isMotionValue, MotionProps, motionValue, useTransform, Axis } from "@incremental-html/framer-motion";
import { Feature, queryFeature } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

function useDefaultMotionValue(value: any, defaultValue: number = 0) {
    return isMotionValue(value) ? value : motionValue(defaultValue)
}

const mix = (from: number, to: number, progress: number) => -progress * from + progress * to + from;

export class Reorder extends Feature<MotionProps> {
    public static Group = class extends Feature<{ axis: 'x' | 'y' }> {
    } as any;
    private point = {
        x: useDefaultMotionValue(this.props.style?.x),
        y: useDefaultMotionValue(this.props.style?.y)
    }
    // useTransform returns a MotionValue with stop hook, 
    // need to save to member field to be called at unmount
    private zIndex = useTransform([this.point.x, this.point.y], ([latestX, latestY]) => latestX || latestY ? 1 : "unset");
    private axis = this.create(() => {
        const group: any = queryFeature(this.element, Reorder.Group);
        if (!group) {
            return 'y';
        }
        return group.props.axis;
    })
    private get nextItem(): Reorder | undefined {
        let item = this.element.nextSibling;
        while (item) {
            if (item.nodeType === 1) {
                const reorder = queryFeature(item as Element, Reorder);
                if (reorder) {
                    return reorder;
                }
            }
            item = item.nextSibling;
        }
        return undefined;
    }
    private onDrag: MotionProps['onDrag'] = (event, { velocity }) => {
        if (!velocity[this.axis]) {
            return;
        }
        const offset = this.point[this.axis].get();
        // console.log(this.point[this.axis].get(), velocity[this.axis]);
        if (velocity[this.axis] > 0) {
            const item = this.nextItem;
            if (!item?.layout) {
                return;
            }
            const itemCenter = mix(item.layout.min, item.layout.max, 0.5);
            if (this.layout.max + offset > itemCenter) {
                this.element.parentElement!.insertBefore(item.element, this.element);
            }
        } else {

        }
    }
    private layout: Axis;
    private onLayoutMeasure: MotionProps['onLayoutMeasure'] = (measured) => {
        this.layout = measured[this.axis];
    }
    private get mergedProps(): MotionProps {
        const layout = this.props.layout === undefined ? true : this.props.layout;
        return {
            drag: this.axis,
            ...this.props,
            dragSnapToOrigin: true,
            layout,
            style: { ...this.props.style, x: this.point.x, y: this.point.y, zIndex: this.zIndex },
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

// export function checkReorder<T>(
//     order: ItemData<T>[],
//     value: T,
//     offset: number,
//     velocity: number
// ): ItemData<T>[] {
//     if (!velocity) return order

//     const index = order.findIndex((item) => item.value === value)

//     if (index === -1) return order

//     const nextOffset = velocity > 0 ? 1 : -1
//     const nextItem = order[index + nextOffset]

//     if (!nextItem) return order

//     const item = order[index]
//     const nextLayout = nextItem.layout
//     const nextItemCenter = mix(nextLayout.min, nextLayout.max, 0.5)

//     if (
//         (nextOffset === 1 && item.layout.max + offset > nextItemCenter) ||
//         (nextOffset === -1 && item.layout.min + offset < nextItemCenter)
//     ) {
//         return moveItem(order, index, index + nextOffset)
//     }

//     return order
// }