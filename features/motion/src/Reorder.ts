import { animate, Axis, isMotionValue, MotionProps, motionValue, useTransform, animationControls } from "@incremental-html/framer-motion";
import { morph } from "@incremental-html/morph";
import { Feature, queryFeature, ref } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

function useDefaultMotionValue(value: any, defaultValue: number = 0) {
    return isMotionValue(value) ? value : motionValue(defaultValue)
}

const mix = (from: number, to: number, progress: number) => -progress * from + progress * to + from;

export class Reorder extends Feature<MotionProps & { whileNotAtOrigin?: string }> {
    public static Group = class extends Feature<{ axis: 'x' | 'y' }> {
    } as any;
    private point = {
        x: useDefaultMotionValue(this.props.style?.x),
        y: useDefaultMotionValue(this.props.style?.y)
    }
    // useTransform returns a MotionValue with stop hook, 
    // need to save to member field to be called at unmount
    private zIndex = useTransform([this.point.x, this.point.y], ([latestX, latestY]) => {
        return latestX || latestY ? 1 : "unset";
    });
    private axis = this.create(() => {
        const group: any = queryFeature(this.element, Reorder.Group);
        if (!group) {
            return 'y';
        }
        return group.props.axis;
    });
    private _1 = this.onMount(() => {
        let isActive = false;
        return this.point[this.axis].onChange((latest: number) => {
            const wasActive = isActive;
            if (latest !== 0) {
                isActive = true;
                if (isActive !== wasActive) {
                    if (this.props.whileNotAtOrigin) {
                        this.animateControls.start(this.props.whileNotAtOrigin);
                    }
                }
            } else {
                isActive = false;
                if (isActive !== wasActive) {
                    if (typeof this.props.initial === 'string') {
                        this.animateControls.start(this.props.initial);
                    }
                }
            }
        });
    });
    private isReording = this.create(() => {
        let isReording = (this.element.parentElement as any).$isReording;
        if (!isReording) {
            (this.element.parentElement as any).$isReording = isReording = ref(false)
        }
        return isReording;
    });
    private get nextItem(): Reorder | undefined {
        if (this.isReording.value) {
            return undefined;
        }
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
    private get previousItem(): Reorder | undefined {
        if (this.isReording.value) {
            return undefined;
        }
        let item = this.element.previousSibling;
        while (item) {
            if (item.nodeType === 1) {
                const reorder = queryFeature(item as Element, Reorder);
                if (reorder) {
                    return reorder;
                }
            }
            item = item.previousSibling;
        }
        return undefined;
    }
    private onDrag: MotionProps['onDrag'] = (event, { velocity }) => {
        if (this.isReording.value) {
            return;
        }
        if (!velocity[this.axis]) {
            return;
        }
        const offset = this.point[this.axis].get();
        if (velocity[this.axis] > 0) {
            const item = this.nextItem;
            if (!item?.layout) {
                return;
            }
            const itemCenter = mix(item.layout.min, item.layout.max, 0.5);
            if (this.layout.max + offset > itemCenter) {
                const parent = this.element.parentElement!;
                this.isReording.value = true;
                morph(parent, () => {
                    parent.insertBefore(this.element, item.element.nextSibling);
                })
                setTimeout(() => { this.isReording.value = false }, 0);
            }
        } else {
            const item = this.previousItem;
            if (!item?.layout) {
                return;
            }
            const itemCenter = mix(item.layout.min, item.layout.max, 0.5);
            if (this.layout.min + offset < itemCenter) {
                const parent = this.element.parentElement!;
                this.isReording.value = true;
                morph(parent, () => {
                    parent.insertBefore(this.element, item.element);
                })
                setTimeout(() => { this.isReording.value = false }, 0);
            }
        }
    }
    private layout: Axis;
    private onLayoutMeasure: MotionProps['onLayoutMeasure'] = (measured) => {
        this.layout = measured[this.axis];
    }
    private animateControls = animationControls();
    private get mergedProps(): MotionProps {
        const layout = this.props.layout === undefined ? true : this.props.layout;
        return {
            drag: this.axis,
            animate: this.animateControls,
            ...this.props,
            dragSnapToOrigin: true,
            layout,
            style: { ...this.props.style, x: this.point.x, y: this.point.y, zIndex: this.zIndex },
            onDrag: this.onDrag,
            onLayoutMeasure: this.onLayoutMeasure
        }
    }
    private _2 = this.onMount(() => {
        const motion = new Motion(this.element, () => this.mergedProps);
        return () => {
            return motion.unmount();
        }
    })
}