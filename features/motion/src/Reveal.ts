import { animate, MotionProps, MotionValue, motionValue, useTransform } from "@incremental-html/framer-motion";
import { Feature } from "@incremental-html/reactivity";
import { render } from "@incremental-html/template";
import { Motion } from "./Motion";

export class RevealItem extends Feature<{ reveal: Reveal, x: MotionValue<number> }> {
    public readonly realWidth = this.create(() => {
        const width = this.element.offsetWidth;
        // ensure width is wide enough to avoid showing underlying element when dragging elastic
        this.element.style.minWidth = `${this.props.reveal.realWidth}px`;
        return width;
    })
    private rebaseOffset = this.element.offsetLeft - this.props.reveal.element.offsetLeft;
    private rebasedX = useTransform(this.props.x, (value) => {
        return value - this.rebaseOffset;
    });
    private _ = this.onMount(() => {
        const motion = new Motion(this.element, () => ({ style: { x: this.rebasedX } }));
        return () => {
            return motion.unmount();
        }
    })
}

export class Reveal extends Feature<MotionProps & { trailingItems?: string | HTMLTemplateElement }> {
    public static Item = RevealItem;
    public readonly x = motionValue(0);
    private trailingItems: RevealItem[] = [];
    private leadingItems: RevealItem[] = [];
    private trailingLimit = 0;
    private dragStart: number;
    public readonly realWidth = this.element.offsetWidth;
    private onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
        if (this.dragStart !== undefined) {
            // already initialized
            return;
        }
        this.dragStart = 0;
        this.initTrailingItems();
    }
    private initTrailingItems() {
        if (!this.props.trailingItems) {
            return;
        }
        const nodes = render(this.props.trailingItems, { target: this.element });
        for (const node of nodes) {
            if (node.nodeType !== 1) {
                continue;
            }
            const index = this.trailingItems.length;
            const props = {
                reveal: this, x: useTransform(this.x, (value) => {
                    let distanceToLeftEdge = 0;
                    for (let i = 0; i < index; i++) {
                        distanceToLeftEdge += this.trailingItems[i].realWidth;
                    }
                    return this.realWidth + value - value * distanceToLeftEdge / this.trailingLimit;
                }) as any
            };
            this.element.parentElement!.appendChild(node);
            const item = new RevealItem(node as Element, () => props);
            this.trailingLimit += item.realWidth;
            this.trailingItems.push(item);
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
        Object.assign(this.element.style, {
            userSelect: 'none',
            touchAction: 'pan-y'
        })
        return new Motion(this.element, () => this.mergedProps);
    })
}