import { animate, MotionProps, motionValue, useTransform } from "@incremental-html/framer-motion";
import { Feature, queryFeature } from "@incremental-html/reactivity";
import { Motion } from "./Motion";

export class RevealItem extends Feature<MotionProps & { edge: 'trailing' | 'leading' }> {
    private reveal = this.create(() => {
        let sibling = this.element.previousSibling;
        while (sibling) {
            const reveal = queryFeature(sibling, Reveal);
            if (reveal) {
                return reveal;
            }
            sibling = sibling.previousSibling;
        }
        throw new Error('can not use Reveal.Item without Reveal');
    })
    public readonly realWidth = this.create(() => {
        const width = this.element.offsetWidth;
        this.element.style.minWidth = `${this.reveal.realWidth}px`;
        return width;
    })
    private x = this.reveal.registerItem(this, this.realWidth);
    private rebaseOffset = 0;
    private rebasedX = useTransform(this.x, (value) => {
        return value - this.rebaseOffset;
    });
    public updateRebaseOffset() {
        this.rebaseOffset = this.element.offsetLeft - this.reveal.element.offsetLeft;
    }
    private get mergedProps() {
        let { style } = this.props;
        return {
            ...this.props,
            style: { ...style, x: this.rebasedX }
        }
    }
    private _ = this.onMount(() => {
        const motion = new Motion(this.element, () => this.mergedProps);
        return () => {
            return motion.unmount();
        }
    })
}

export class Reveal extends Feature<MotionProps> {
    public static Item = RevealItem;
    public readonly x = motionValue(0);
    private trailingItems: RevealItem[] = [];
    private leadingItems: RevealItem[] = [];
    private trailingLimit = 0;
    public registerItem(item: RevealItem, width: number) {
        const index = this.trailingItems.length;
        if (item.props.edge === 'leading') {
            this.leadingItems.push(item);
        } else {
            this.trailingItems.push(item);
        }
        this.trailingLimit += width;
        return useTransform(this.x, (value) => {
            let distanceToLeftEdge = 0;
            for (let i = 0; i < index; i++) {
                distanceToLeftEdge += this.trailingItems[i].realWidth;
            }
            return this.realWidth + value - value * distanceToLeftEdge / this.trailingLimit;
        })
    }
    private dragStart = 0;
    public readonly realWidth = this.element.offsetWidth;
    private onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
        for (const item of this.trailingItems) {
            item.updateRebaseOffset();
        }
    }
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
        this.motion.setLayoutAnimationBlocked(true);
        const x = this.dragStart + offset.x;
        if (x < 0 && this.trailingLimit > 0) {
            this.x.set(x);
        } else {

        }
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
        let x = this.dragStart + offset.x;
        if (x < 0) {
            if (this.trailingLimit === 0) {
                return;
            }
            if (-x > this.trailingLimit) {
                x = -this.trailingLimit + (this.trailingLimit + x) * 0.1;
            }
            this.x.set(x);
        } else {

        }
    }
    private onPanEnd: MotionProps['onPanEnd'] = (e, { offset }) => {
        const x = this.dragStart + offset.x;
        if (x < 0 && this.trailingLimit && -x > this.trailingLimit / 2) {
            this.dragStart = -this.trailingLimit;
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
        return new Motion(this.element, () => this.mergedProps);
    })
}