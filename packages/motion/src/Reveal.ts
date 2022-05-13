import { animate, MotionProps, motionValue } from "@incremental-html/framer-motion";
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
    private get mergedProps(): MotionProps {
        if (!this.reveal) {
            return this.props;
        }
        let { style } = this.props;
        return {
            ...this.props,
            style: { ...style, x: this.reveal.x },
        }
    }
    private _ = this.onMount(() => {
        notifyNodeSubscribers(this.element.parentElement!);
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
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
        this.motion.setLayoutAnimationBlocked(true);
        if (offset.x < 0 && this.rightItem) {
            this.x.set(offset.x);
        } else {

        }
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
        if (offset.x < 0) {
            if (!this.rightItem) {
                return;
            }
            const limit = this.rightItem.boundingClientRect.width;
            if (-offset.x > limit) {
                this.x.set(-limit + (limit + offset.x) * 0.2);
            } else {
                this.x.set(offset.x);
            }
        } else {

        }
    }
    private onPanEnd: MotionProps['onPanEnd'] = (e, panInfo) => {
        animate(this.x, 0);
        this.motion.setLayoutAnimationBlocked(false);
    }
    private get mergedProps(): MotionProps {
        let { style } = this.props;
        return {
            ...this.props,
            style: { ...style, x: this.x },
            onPanStart: this.onPanStart,
            onPan: this.onPan,
            onPanEnd: this.onPanEnd
        }
    }
    private motion: Motion = this.create(() => {
        notifyNodeSubscribers(this.element.parentElement!);
        return new Motion(this.element, () => this.mergedProps);
    })
}