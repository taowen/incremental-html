import { animate, MotionProps, motionValue, useTransform } from "@incremental-html/framer-motion";
import { Feature, queryFeature, subscribeNode } from "@incremental-html/reactivity";
import { notifyNodeSubscribers } from "@incremental-html/reactivity/dist/esm/subscribeNode";
import { Motion } from "./Motion";

export class RevealItem extends Feature<MotionProps> {
    public get boundingClientRect() {
        return this.element.getBoundingClientRect();
    };
    private get leftReveal() {
        subscribeNode(this.element.parentElement);
        let sibling = this.element.previousSibling;
        while (sibling) {
            const reveal = queryFeature(sibling, Reveal);
            if (reveal) {
                return reveal;
            }
            sibling = sibling.previousSibling;
        }
        return undefined;
    }
    private get rightReveal() {
        subscribeNode(this.element.parentElement);
        let sibling = this.element.nextSibling;
        while (sibling) {
            const reveal = queryFeature(sibling, Reveal);
            if (reveal) {
                return reveal;
            }
            sibling = sibling.nextSibling;
        }
        return undefined;
    }
    private get reveal() {
        return this.leftReveal || this.rightReveal;
    }
    private get scaleX() {
        if (!this.reveal) {
            return undefined;
        }
        return useTransform(this.reveal.x, (value) => {
            return Math.abs(value) / this.boundingClientRect.width;
        })
    }
    private get mergedProps(): MotionProps {
        if (!this.reveal) {
            return this.props;
        }
        let { style } = this.props;
        return {
            ...this.props,
            style: {
                ...style,
                x: this.reveal.x,
                scaleX: this.scaleX
            },
        }
    }
    private _ = this.onMount(() => {
        notifyNodeSubscribers(this.element.parentElement!);
        (this.element as HTMLElement).style.transformOrigin = '0 0';
        const motion = new Motion(this.element, () => this.mergedProps);
        return () => {
            return motion.unmount();
        }
    })
}

export class Reveal extends Feature<MotionProps> {
    public static Item = RevealItem;
    public readonly x = motionValue(0);
    private get leftItem(): RevealItem | undefined {
        subscribeNode(this.element.parentElement);
        let sibling = this.element.previousSibling;
        while (sibling) {
            const item = queryFeature(sibling, RevealItem);
            if (item) {
                return item;
            }
            sibling = sibling.previousSibling;
        }
        return undefined;
    }
    private get rightItem(): RevealItem | undefined {
        subscribeNode(this.element.parentElement);
        let sibling = this.element.nextSibling;
        while (sibling) {
            const item = queryFeature(sibling, RevealItem);
            if (item) {
                return item;
            }
            sibling = sibling.nextSibling;
        }
        return undefined;
    }
    private dragStart: number;
    private onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
        if (this.dragStart === undefined) {
            this.dragStart = 0;
        }
    }
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
        this.motion.setLayoutAnimationBlocked(true);
        const x = this.dragStart + offset.x;
        if (x < 0 && this.rightItem) {
            this.x.set(x);
        } else {

        }
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
        const x = this.dragStart + offset.x;
        if (x < 0) {
            if (!this.rightItem) {
                return;
            }
            const limit = this.rightItem.boundingClientRect.width;
            if (-x > limit) {
                this.x.set(-limit + (limit + x) * 0.1);
            } else {
                this.x.set(x);
            }
        } else {

        }
    }
    private onPanEnd: MotionProps['onPanEnd'] = (e, { offset }) => {
        const x = this.dragStart + offset.x;
        if (x < 0 && this.rightItem && -x > this.rightItem.boundingClientRect.width / 2) {
            this.dragStart = -this.rightItem.boundingClientRect.width;
        } else {
            this.dragStart = 0;
        }
        animate(this.x, this.dragStart);
        this.motion.setLayoutAnimationBlocked(false);
    }
    private get mergedProps(): MotionProps {
        let { style } = this.props;
        return {
            ...this.props,
            style: { ...style, x: this.x },
            onPanStart: this.onPanStart,
            onPan: this.onPan,
            onPanEnd: this.onPanEnd,
            onPanSessionStart: this.onPanSessionStart
        }
    }
    private motion: Motion = this.create(() => {
        notifyNodeSubscribers(this.element.parentElement!);
        return new Motion(this.element, () => this.mergedProps);
    })
}