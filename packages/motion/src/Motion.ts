import { makeVisualState, htmlVisualElement, animationControls, createAnimationState, MotionProps } from '@incremental-html/framer-motion';
import { Feature } from '@incremental-html/reactivity';
import { toRawElement } from '@incremental-html/reactivity/dist/esm/src/subscribeNode';

export class Motion extends Feature<{}> {
    public static get featureName(): string {
        return 'motion';
    }
    private get rawElement() {
        return toRawElement(this.element);
    }
    private visualElement = this.create(() => {
        const motionProps: MotionProps = this.props;
        const visualState = makeVisualState(motionProps, {}, null);
        if (visualState.mount) {
            visualState.mount(this.rawElement);
        }
        const visualElement = htmlVisualElement({
            visualState,
            props: motionProps
        });
        visualElement.animationState = createAnimationState(visualElement);
        return visualElement;
    })
    public _1 = this.effect(() => {
        this.visualElement.mount(this.rawElement);
        return () => {
            this.visualElement.unmount();
        }
    })
    public _2 = this.effect(() => {
        this.visualElement.syncRender();
        if (this.visualElement.animationState) {
            this.visualElement.animationState.animateChanges();
        }
    })
}