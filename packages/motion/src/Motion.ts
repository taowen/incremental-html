import { makeVisualState, htmlVisualElement, createAnimationState, MotionProps, AnimationType, useProjection, HTMLProjectionNode, 
    MeasureLayoutWithContext, addPointerEvent, createHoverEvent } from '@incremental-html/framer-motion';
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
    public _1 = this.onMount(() => {
        this.visualElement.mount(this.element as HTMLElement);
        const featureProps = {...this.props, visualElement: this.visualElement, isPresent: true};
        MeasureLayoutWithContext.componentDidMount(featureProps);
        const hoverStartHandler = this.props.onHoverStart || this.props.whileHover
            ? createHoverEvent(this.visualElement, true, this.props.onHoverStart)
            : undefined;
        if (hoverStartHandler) {
            addPointerEvent(this.element, 'pointerenter', hoverStartHandler);
        }
        const hoverEndHandler = this.props.onHoverEnd || this.props.whileHover
            ? createHoverEvent(this.visualElement, false, this.props.onHoverEnd)
            : undefined;
        if (hoverEndHandler) {
            addPointerEvent(this.element, 'pointerleave', hoverEndHandler);
        }
        return () => {
            this.visualElement.unmount();
            const featureProps = {...this.props, visualElement: this.visualElement, isPresent: true};
            MeasureLayoutWithContext.componentWillUnmount(featureProps);
        }
    })
    public _2 = this.effect(() => {
        this.visualElement.setProps(this.props);
        this.visualElement.animationState!.animateChanges();
    })
    public _3 = this.effect(() => {
        (this.element as any).$beforeRemove = () => {
            return this.visualElement.animationState!.setActive(AnimationType.Exit, true)
        }
    })
    private beforeMorph = () => {
        const featureProps = {...this.props, visualElement: this.visualElement, isPresent: true};
        MeasureLayoutWithContext.getSnapshotBeforeUpdate(featureProps, featureProps);
    }
    private afterMorph = () => {
        const featureProps = {...this.props, visualElement: this.visualElement, isPresent: true};
        MeasureLayoutWithContext.componentDidUpdate(featureProps);
    }
    public _4 = this.effect(() => {
        if (!this.props.layout) {
            return;
        }
        const ancestors: HTMLElement[] = [];
        let parent = this.element.parentElement;
        while(parent) {
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