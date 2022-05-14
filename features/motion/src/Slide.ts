import { MotionProps, motionValue, addPointerEvent, animate } from "@incremental-html/framer-motion";
import { Feature } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

export class Slide extends Feature<MotionProps> {
    private scrollX = motionValue(0);
    public dragX = motionValue(0);
    private dragStart: number;
    private current = this.element.firstElementChild as HTMLElement;
    private onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
        this.dragStart = this.element.scrollLeft;
    }
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
        this.scrollX.set(this.dragStart + -offset.x * 0.2);
        this.dragX.set(offset.x);
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
        this.scrollX.set(this.dragStart + -offset.x * 0.2);
        this.dragX.set(offset.x);
    }
    private onPanEnd: MotionProps['onPanEnd'] = (e, { offset }) => {
        if (offset.x < 0 && offset.x < -this.element.offsetWidth / 8) {
            const next = this.current.nextElementSibling as HTMLElement;
            this.current = next || this.current;
        } else if (offset.x > 0 && offset.x > this.element.offsetWidth / 8) {
            const next = this.current.previousElementSibling as HTMLElement;
            this.current = next || this.current;
        }
        this.dragX.set(0);
        animate(this.scrollX, this.current.offsetLeft);
    }
    private get mergedProps(): MotionProps {
        return {
            ...this.props,
            onPanStart: this.onPanStart,
            onPan: this.onPan,
            onPanEnd: this.onPanEnd,
            onPanSessionStart: this.onPanSessionStart
        }
    }
    private _ = this.onMount(() => {
        Object.assign(this.element.style, {
            userSelect: 'none',
            touchAction: 'pan-y',
        })
        const unsubscribe = this.scrollX.onChange((value) => {
            this.element.scrollLeft = value;
        })
        const motion = new Motion(this.element, () => this.mergedProps);
        return () => {
            unsubscribe();
            return motion.unmount();
        }
    });
}
