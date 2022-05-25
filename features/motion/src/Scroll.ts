import { animate, MotionProps, motionValue } from "@incremental-html/framer-motion";
import { morphChildNodes } from "@incremental-html/morph";
import { Feature, closestFeature, Ref, ref } from "@incremental-html/reactivity";
import { render } from "@incremental-html/template";
import { Motion } from "./Motion";

class ScrollPullable extends Feature<MotionProps & { handle?: () => Promise<void>; }> {
    private refStatus: Ref<'default' | 'will-handle' | 'handling'> = ref('default')
    public dragY = motionValue(0);
    private threshold = 0;
    public get status() {
        return this.refStatus.value;
    }
    public set status(value: 'default' | 'will-handle' | 'handling') {
        this.refStatus.value = value;
    }
    private _1 = this.onMount(() => {
        this.scroll.pullable = this;
        return () => {
            this.scroll.pullable = undefined;
        }
    })
    private get scroll() {
        const scroll = closestFeature(this.element, Scroll);
        if (!scroll) {
            throw new Error('can not use Scroll.Pullable without Scroll');
        }
        return scroll;
    }
    private template = this.create(() => {
        const template = document.createElement('template');
        let child = this.indicator.firstChild;
        while (child) {
            template.content.appendChild(child.cloneNode(true));
            child = child.nextSibling;
        }
        return template;
    })
    private get mergedProps(): MotionProps {
        const { style } = this.props;
        return {
            ...this.props,
            style: { ...style, y: this.dragY }
        }
    }
    private motion: Motion = this.create(() => {
        Object.assign(this.element.style, {
            userSelect: 'none',
            touchAction: 'pan-x',
        })
        return new Motion(this.element, () => this.mergedProps);
    })
    private _2 = this.effect(() => {
        const nodes = render(this.template, { status: this.status });
        morphChildNodes(this.indicator, nodes);
    })
    private get indicator() {
        return this.element.firstElementChild as HTMLElement;
    }
    public onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
        this.threshold = this.indicator ? this.indicator.getBoundingClientRect().height : 0;
    }
    public handleDrag(dragY: number) {
        this.dragY.set(dragY);
        this.status = dragY > this.threshold ? 'will-handle' : 'default'
    }
    public onPanEnd: MotionProps['onPanEnd'] = async (e, { offset }) => {
        if (this.props?.handle && this.status === 'will-handle') {
            animate(this.dragY, this.threshold);
            try {
                this.status = 'handling';
                await this.props.handle();
            } finally {
                this.status = 'default';
                animate(this.dragY, 0);
            }
        } else {
            this.status = 'default';
            animate(this.dragY, 0);
        }
    }
}

export class Scroll extends Feature<MotionProps & { onPullDown?: () => Promise<void>; }> {
    public static Pullable = ScrollPullable;
    private dragStart: number;
    public pullable?: ScrollPullable;
    private onPanSessionStart: MotionProps['onPanSessionStart'] = (e, info) => {
        this.dragStart = this.element.scrollTop;
        if (this.pullable) {
            this.pullable.onPanSessionStart!(e, info);
        }
    }
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
        this.applyOffset(offset.y);
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
        this.applyOffset(offset.y);
    }
    private onPanEnd: MotionProps['onPanEnd'] = async (e, panInfo) => {
        if (this.pullable) {
            this.pullable.onPanEnd!(e, panInfo);
        }
    }
    private applyOffset(offsetY: number) {
        const pos = this.dragStart - offsetY;
        this.element.scrollTop = pos > 0 ? pos : 0;
        if (this.pullable) {
            const dragY = -pos * 0.4;
            this.pullable.handleDrag(dragY > 0 ? dragY : 0);
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
}