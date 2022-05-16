import { MotionProps } from "@incremental-html/framer-motion";
import { Feature } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

export class Scroll extends Feature<MotionProps> {
    private onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
    }
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
    }
    private onPanEnd: MotionProps['onPanEnd'] = (e, { offset }) => {
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
            touchAction: 'pan-y',
        })
        return new Motion(this.element, () => this.mergedProps);
    })
}