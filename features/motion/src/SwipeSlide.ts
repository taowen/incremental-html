import { MotionProps, motionValue, animate } from "@incremental-html/framer-motion";
import { Feature, Ref, ref } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

export class SwipeSlide extends Feature<MotionProps> {
    private scrollX = motionValue(0);
    public offsetX = motionValue(0);
    private dragStart: number;
    private active: Ref<any> = ref(this.element.firstElementChild as HTMLElement);
    public isActive(element: string | HTMLElement): boolean {
        if (!element) {
            return false;
        }
        if (typeof element === 'string') {
            return this.isActive(document.querySelector(element) as any);
        }
        return this.active.value === element;
    }
    public setActive(element: string | HTMLElement): void {
        if (!element) {
            return;
        }
        if (typeof element === 'string') {
            return this.setActive(document.querySelector(element) as any);
        }
        this.active.value = element;
        animate(this.scrollX, this.active.value.offsetLeft);
    }
    private onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
        this.dragStart = this.element.scrollLeft;
    }
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
        this.scrollX.set(this.dragStart + -offset.x * 0.2);
        this.offsetX.set(offset.x);
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
        this.scrollX.set(this.dragStart + -offset.x * 0.2);
        this.offsetX.set(offset.x);
    }
    private onPanEnd: MotionProps['onPanEnd'] = (e, { offset }) => {
        if (offset.x < 0 && offset.x < -this.element.offsetWidth / 8) {
            const next = this.active.value.nextElementSibling as HTMLElement;
            this.active.value = next || this.active.value;
        } else if (offset.x > 0 && offset.x > this.element.offsetWidth / 8) {
            const next = this.active.value.previousElementSibling as HTMLElement;
            this.active.value = next || this.active.value;
        }
        this.offsetX.set(0);
        animate(this.scrollX, this.active.value.offsetLeft);
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
            return motion.__unmount__();
        }
    });
}
