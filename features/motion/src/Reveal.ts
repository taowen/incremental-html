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

export class Reveal extends Feature<MotionProps & { trailingItems?: string | HTMLTemplateElement, leadingItems?: string | HTMLTemplateElement }> {
    public static Item = RevealItem;
    public readonly x = motionValue(0);
    private trailingItems: RevealItem[] = [];
    private leadingItems: RevealItem[] = [];
    private leadingTotalWidth = 0;
    private trailingTotalWidth = 0;
    private dragStart: number;
    public readonly realWidth = this.element.offsetWidth;
    private onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
        if (this.dragStart !== undefined) {
            // already initialized
            return;
        }
        this.dragStart = 0;
        this.initLeadingItems();
        this.initTrailingItems();
    }
    private initLeadingItems() {
        if (!this.props.leadingItems) {
            return;
        }
        const nodes = render(this.props.leadingItems, { target: this.element });
        for (const node of nodes) {
            if (node.nodeType !== 1) {
                continue;
            }
            const index = this.leadingItems.length;
            const props = {
                reveal: this, x: useTransform(this.x, (value) => {
                    let distanceToEdge = 0;
                    for (let i = 0; i < index; i++) {
                        distanceToEdge += this.leadingItems[i].realWidth;
                    }
                    return value * distanceToEdge / this.leadingTotalWidth;
                }) as any
            };
            this.element.parentElement!.appendChild(node);
            const item = new RevealItem(node as Element, () => props);
            this.leadingTotalWidth += item.realWidth;
            this.leadingItems.push(item);
        }
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
                    let distanceToEdge = 0;
                    for (let i = 0; i < index; i++) {
                        distanceToEdge += this.trailingItems[i].realWidth;
                    }
                    const edge = this.realWidth + value;
                    return edge - value * distanceToEdge / this.trailingTotalWidth;
                }) as any
            };
            this.element.parentElement!.appendChild(node);
            const item = new RevealItem(node as Element, () => props);
            this.trailingTotalWidth += item.realWidth;
            this.trailingItems.push(item);
        }
    }
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
        this.motion.setLayoutAnimationBlocked(true);
        const x = this.dragStart + offset.x;
        if (x < 0 && this.trailingTotalWidth > 0) {
            this.x.set(x);
        } else if (x > 0 && this.leadingTotalWidth > 0) {
            this.x.set(x);
        }
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
        let x = this.dragStart + offset.x;
        if (x < 0) {
            if (this.trailingTotalWidth === 0) {
                return;
            }
            if (-x > this.trailingTotalWidth) {
                x = -this.trailingTotalWidth + (x + this.trailingTotalWidth) * 0.1;
            }
            this.x.set(x);
        } else if (x > 0) {
            if (this.leadingTotalWidth === 0) {
                return;
            }
            if (x > this.leadingTotalWidth) {
                x = this.leadingTotalWidth + (x - this.leadingTotalWidth) * 0.1;
            }
            this.x.set(x);
        }
    }
    private onPanEnd: MotionProps['onPanEnd'] = (e, { offset }) => {
        const x = this.dragStart + offset.x;
        if (x < 0 && this.trailingTotalWidth && -x > this.trailingTotalWidth / 2) {
            this.dragStart = -this.trailingTotalWidth;
        } else if (x > 0 && this.leadingTotalWidth && x > this.leadingTotalWidth / 2) {
            this.dragStart = this.leadingTotalWidth;
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
            zIndex: '999',
            userSelect: 'none',
            touchAction: 'pan-y'
        })
        return new Motion(this.element, () => this.mergedProps);
    })
}