import { makeVisualState, htmlVisualElement, createAnimationState, MotionProps, AnimationType } from '@incremental-html/framer-motion';
import { Feature } from '@incremental-html/reactivity';

export class Motion extends Feature<{}> {
    private visualElement = this.create(() => {
        const motionProps: MotionProps = this.props;
        const visualState = makeVisualState(motionProps, {}, null);
        if (visualState.mount) {
            visualState.mount(this.element);
        }
        const visualElement = htmlVisualElement({
            visualState,
            props: motionProps
        });
        visualElement.animationState = createAnimationState(visualElement);
        visualElement.syncRender();
        return visualElement;
    })
    public _1 = this.effect(() => {
        this.visualElement.mount(this.element as HTMLElement);
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
}