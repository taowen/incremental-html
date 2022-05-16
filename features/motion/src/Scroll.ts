import { animate, MotionProps, motionValue } from "@incremental-html/framer-motion";
import { Feature } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

export class Scroll extends Feature<MotionProps> {
    private dragStart: number;
    private onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
        this.dragStart = this.element.scrollTop;
    }
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
        this.applyOffset(offset.y);
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
        this.applyOffset(offset.y);
    }
    private onPanEnd: MotionProps['onPanEnd'] = (e, { offset }) => {
        animate(this.innerY, 0);
    }
    private applyOffset(offsetY: number) {
        const pos = this.dragStart - offsetY;
        if (pos < 0) {
            this.innerY.set(-pos * 0.4);
            this.element.scrollTop = 0;
        } else {
            this.element.scrollTop = pos;
        }
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
    private motion: Motion = this.create(() => {
        Object.assign(this.element.style, {
            userSelect: 'none',
            touchAction: 'pan-x',
        })
        return new Motion(this.element, () => this.mergedProps);
    })
    private innerY = motionValue(0);
    private get inner() {
        return this.element.firstElementChild as HTMLElement;
    }
    private innerMotion: Motion = this.create(() => {
        Object.assign(this.inner.style, {
            userSelect: 'none',
            touchAction: 'pan-x',
        })
        return new Motion(this.inner, () => ({ style: { y: this.innerY } }));
    })
}