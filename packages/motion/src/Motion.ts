import { makeVisualState, htmlVisualElement, createAnimationState, MotionProps, AnimationType, useProjection, HTMLProjectionNode, MeasureLayoutWithContext } from '@incremental-html/framer-motion';
import { Feature, subscribeNode } from '@incremental-html/reactivity';

let nextProjectionId = 1;

export class Motion extends Feature<MotionProps> {
    private visualElement = this.create(() => {
        const visualState = makeVisualState(this.props, {}, null);
        if (visualState.mount) {
            visualState.mount(this.element);
        }
        const visualElement = htmlVisualElement({
            visualState,
            props: this.props
        });
        visualElement.animationState = createAnimationState(visualElement);
        useProjection(nextProjectionId++, this.props, {}, visualElement, HTMLProjectionNode);
        visualElement.syncRender();
        return visualElement;
    })
    public _1 = this.effect(() => {
        this.visualElement.mount(this.element as HTMLElement);
        const featureProps = {...this.props, visualElement: this.visualElement, isPresent: true};
        MeasureLayoutWithContext.componentDidMount(featureProps);
        return () => {
            this.visualElement.unmount();
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