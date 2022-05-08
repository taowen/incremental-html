import { addPointerEvent, AnimationType, createAnimationState, createHoverEvent, EventListenerWithPointInfo, HTMLProjectionNode, htmlVisualElement, makeVisualState, MeasureLayoutWithContext, MotionProps, useProjection, useTapGesture } from '@incremental-html/framer-motion';
import { Feature } from '@incremental-html/reactivity';

let nextProjectionId = 1;

export class Motion extends Feature<MotionProps> {
    private visualElement = this.create(() => {
        const visualState = makeVisualState(this.props, {}, null);
        const visualElement = htmlVisualElement({
            visualState,
            props: this.props
        });
        visualElement.animationState = createAnimationState(visualElement);
        useProjection(nextProjectionId++, this.props, {}, visualElement, HTMLProjectionNode);
        visualElement.syncRender();
        return visualElement;
    })
    private addPointerEvent = (eventName: string, handler?: EventListenerWithPointInfo, options?: AddEventListenerOptions) => {
        if (handler) {
            addPointerEvent(this.element, eventName, handler, options);
        }
    }
    public _1 = this.onMount(() => {
        this.visualElement.mount(this.element as HTMLElement);
        const featureProps = { ...this.props, visualElement: this.visualElement, isPresent: true };
        MeasureLayoutWithContext.componentDidMount(featureProps);
        this.addPointerEvent('pointerenter', this.props.onHoverStart || this.props.whileHover
            ? createHoverEvent(this.visualElement, true, this.props.onHoverStart)
            : undefined);
        this.addPointerEvent('pointerleave', this.props.onHoverEnd || this.props.whileHover
            ? createHoverEvent(this.visualElement, false, this.props.onHoverEnd)
            : undefined);
        return () => {
            this.visualElement.unmount();
            const featureProps = { ...this.props, visualElement: this.visualElement, isPresent: true };
            MeasureLayoutWithContext.componentWillUnmount(featureProps);
        }
    })
    public _2 = this.onMount(useTapGesture({ ...this.props, visualElement: this.visualElement }))
    public _3 = this.effect(() => {
        this.visualElement.setProps(this.props);
        this.visualElement.animationState!.animateChanges();
    })
    public _4 = this.effect(() => {
        (this.element as any).$beforeRemove = () => {
            return this.visualElement.animationState!.setActive(AnimationType.Exit, true)
        }
    })
    private beforeMorph = () => {
        const featureProps = { ...this.props, visualElement: this.visualElement, isPresent: true };
        MeasureLayoutWithContext.getSnapshotBeforeUpdate(featureProps, featureProps);
    }
    private afterMorph = () => {
        const featureProps = { ...this.props, visualElement: this.visualElement, isPresent: true };
        MeasureLayoutWithContext.componentDidUpdate(featureProps);
    }
    public _5 = this.effect(() => {
        if (!this.props.layout) {
            return;
        }
        const ancestors: HTMLElement[] = [];
        let parent = this.element.parentElement;
        while (parent) {
            if (parent === document.body) {
                break;
            }
            ancestors.push(parent);
            parent.addEventListener('beforeMorph', this.beforeMorph);
            parent.addEventListener('afterMorph', this.afterMorph);
            parent = parent.parentElement;
        }
        return () => {
            for (const parent of ancestors) {
                parent.removeEventListener('beforeMorph', this.beforeMorph);
                parent.removeEventListener('afterMorph', this.afterMorph);
            }
        }
    })
}