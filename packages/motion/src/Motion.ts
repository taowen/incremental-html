import { AnimationType, createAnimationState, HTMLProjectionNode, htmlVisualElement, makeVisualState, MeasureLayoutWithContext, MotionProps, useHoverGesture, useProjection, useTapGesture, useFocusGesture, useViewport, usePanGesture, VisualElementDragControls } from '@incremental-html/framer-motion';
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
        const featureProps = { ...this.props, visualElement: this.visualElement, isPresent: true };
        MeasureLayoutWithContext.componentDidMount(featureProps);
        (this.element as any).$beforeRemove = () => {
            return this.visualElement.animationState!.setActive(AnimationType.Exit, true)
        }
        new VisualElementDragControls(this.visualElement).addListeners();
        return () => {
            this.visualElement.unmount();
            const featureProps = { ...this.props, visualElement: this.visualElement, isPresent: true };
            MeasureLayoutWithContext.componentWillUnmount(featureProps);
        }
    })
    public _2 = this.onMount(() => {
        return useHoverGesture({ ...this.props, visualElement: this.visualElement });
    });
    public _3 = this.onMount(() => {
        return useTapGesture({ ...this.props, visualElement: this.visualElement });
    });
    public _4 = this.onMount(() => {
        return useFocusGesture({ ...this.props, visualElement: this.visualElement });
    });
    public _5 = this.onMount(() => {
        return useViewport({ ...this.props, visualElement: this.visualElement });
    })
    public _6 = this.onMount(() => {
        return usePanGesture({ ...this.props, visualElement: this.visualElement}, {});
    })
    public _7 = this.effect(() => {
        this.visualElement.setProps(this.props);
        this.visualElement.animationState!.animateChanges();
    })
    private beforeMorph = () => {
        const featureProps = { ...this.props, visualElement: this.visualElement, isPresent: true };
        MeasureLayoutWithContext.getSnapshotBeforeUpdate(featureProps, featureProps);
    }
    private afterMorph = () => {
        const featureProps = { ...this.props, visualElement: this.visualElement, isPresent: true };
        MeasureLayoutWithContext.componentDidUpdate(featureProps);
    }
    public _8 = this.effect(() => {
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