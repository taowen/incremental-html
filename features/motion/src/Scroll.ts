import { animate, MotionProps, motionValue } from "@incremental-html/framer-motion";
import { morphChildNodes } from "@incremental-html/morph";
import { Feature, queryFeature, Ref, ref } from "@incremental-html/reactivity";
import { render } from "@incremental-html/template";
import { Motion } from "./Motion";

class ScrollPullable extends Feature<{ handle?: () => Promise<void>; }> {
    private get scroll() {
        const scroll = queryFeature(this.element, Scroll);
        if (!scroll) {
            throw new Error('can not use Scroll.Pullable without Scroll');
        }
        return scroll;
    }
    private template = this.create(() => {
        const template = document.createElement('template');
        let child = this.element.firstChild;
        while (child) {
            template.content.appendChild(child.cloneNode(true));
            child = child.nextSibling;
        }
        return template;
    })
    private _ = this.effect(() => {
        const nodes = render(this.template, { status: this.scroll.status });
        morphChildNodes(this.element, nodes);
    })
}

export class Scroll extends Feature<MotionProps & { onPullDown?: () => Promise<void>; }> {
    public static Pullable = ScrollPullable;
    private dragStart: number;
    private threshold: number;
    private refStatus: Ref<'default' | 'will-handle' | 'handling'> = ref('default')
    public dragY = motionValue(0);
    public get status() {
        return this.refStatus.value;
    }
    private onPanSessionStart: MotionProps['onPanSessionStart'] = () => {
        this.dragStart = this.element.scrollTop;
        this.threshold = this.pullable ? this.pullable.element.getBoundingClientRect().height : 0;
    }
    private onPanStart: MotionProps['onPanStart'] = (e, { offset }) => {
        this.applyOffset(offset.y);
    }
    private onPan: MotionProps['onPan'] = (e, { offset }) => {
        this.applyOffset(offset.y);
    }
    private onPanEnd: MotionProps['onPanEnd'] = async (e, { offset }) => {
        if (this.pullable?.props?.handle && this.status === 'will-handle') {
            animate(this.dragY, this.threshold);
            try {
                this.refStatus.value = 'handling';
                await this.pullable.props.handle();
            } finally {
                this.refStatus.value = 'default';
                animate(this.dragY, 0);
            }
        } else {
            this.refStatus.value = 'default';
            animate(this.dragY, 0);
        }
    }
    private applyOffset(offsetY: number) {
        const pos = this.dragStart - offsetY;
        if (this.pullable && pos < 0) {
            this.element.scrollTop = 0;
            const dragY = -pos * 0.4;
            this.dragY.set(dragY);
            this.refStatus.value = dragY > this.threshold ? 'will-handle' : 'default'
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
    private get inner() {
        return this.element.firstElementChild as HTMLElement;
    }
    private get pullable() {
        return queryFeature(this.inner.firstElementChild, ScrollPullable);
    }
    private innerMotion: Motion = this.create(() => {
        Object.assign(this.inner.style, {
            userSelect: 'none',
            touchAction: 'pan-x',
        })
        return new Motion(this.inner, () => ({ style: { y: this.dragY } }));
    })
}