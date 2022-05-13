import { AnimationType, createAnimationState, HTMLProjectionNode, htmlVisualElement, makeVisualState, MeasureLayoutWithContext, MotionContextProps, MotionProps, useFocusGesture, useHoverGesture, usePanGesture, useProjection, useTapGesture, useViewport, VisualElementDragControls } from '@incremental-html/framer-motion';
import { Feature, queryFeature } from '@incremental-html/reactivity';

let nextProjectionId = 1;

export class Motion extends Feature<MotionProps> {
    private inheritedProps: MotionContextProps = this.create(() => {
        const parentMotion = queryFeature(this.element.parentElement, Motion);
        if (!parentMotion) {
            return {};
        }
        const inheritedProps: MotionContextProps = {};
        if (!this.props.initial) {
            const inherited = parentMotion.mergedProps.initial;
            const isVariant = typeof inherited === 'string' || Array.isArray(inherited);
            if (isVariant) {
                inheritedProps.initial = inherited;
            }
        }
        if (!this.props.animate) {
            const inherited = parentMotion.mergedProps.animate;
            const isVariant = typeof inherited === 'string' || Array.isArray(inherited);
            if (isVariant) {
                inheritedProps.animate = inherited;
            }
        }
        return inheritedProps;
    })
    private visualElement = this.create(() => {
        const visualState = makeVisualState(this.props, this.inheritedProps, null);
        const visualElement = htmlVisualElement({
            visualState,
            props: this.props
        });
        visualElement.animationState = createAnimationState(visualElement);
        useProjection(nextProjectionId++, this.props, {}, visualElement, HTMLProjectionNode);
        return visualElement;
    })
    public setLayoutAnimationBlocked(isBlocked: boolean) {
        this.visualElement.projection!.isAnimationBlocked = isBlocked;
        if (isBlocked) {
            this.visualElement.projection!.target = undefined;
        }
    }
    public readonly dragControls = new VisualElementDragControls(this.visualElement);
    public get mergedProps(): any {
        return { ...this.props, ...this.inheritedProps, visualElement: this.visualElement }
    }
    public _1 = this.onMount(() => {
        if (this.mergedProps.drag && this.mergedProps.dragListener !== false) {
            Object.assign(this.element.style, {
                userSelect: 'none',
                touchAction: this.mergedProps.drag === true ? 'none' : `pan-${this.mergedProps.drag === "x" ? "y" : "x"}`
            })
        }
        this.visualElement.mount(this.element);
        MeasureLayoutWithContext.componentDidMount(this.mergedProps);
        this.dragControls.addListeners();
        // when initial animation is disabled, we need to render the styles
        this.visualElement.syncRender();
        const unmount = () => {
            this.visualElement.unmount();
            MeasureLayoutWithContext.componentWillUnmount(this.mergedProps);
        }
        return () => {
            if (!this.mergedProps.exit) {
                unmount();
                return;
            }
            // play exit animation before unmount
            return (async () => {
                await this.visualElement.animationState!.setActive(AnimationType.Exit, true);
                unmount();
            })();
        }
    })
    public _2 = this.onMount(() => {
        return useHoverGesture(this.mergedProps);
    });
    public _3 = this.onMount(() => {
        return useTapGesture(this.mergedProps);
    });
    public _4 = this.onMount(() => {
        return useFocusGesture(this.mergedProps);
    });
    public _5 = this.onMount(() => {
        return useViewport(this.mergedProps);
    })
    public _6 = this.onMount(() => {
        return usePanGesture(this.mergedProps, {});
    })
    public _7 = this.onMount(() => {
        const animateControls = this.mergedProps.animate;
        if (!(animateControls as any)?.subscribe) {
            return;
        }
        (animateControls as any).subscribe(this.visualElement);
        return (animateControls as any).mount();
    })
    public _8 = this.effect(() => {
        this.visualElement.setProps(this.mergedProps);
        this.visualElement.animationState!.animateChanges();
    })
    private beforeMorph = () => {
        MeasureLayoutWithContext.getSnapshotBeforeUpdate(this.mergedProps, this.mergedProps);
    }
    private afterMorph = () => {
        MeasureLayoutWithContext.componentDidUpdate(this.mergedProps);
    }
    public _9 = this.effect(() => {
        if (!this.mergedProps.layout && !this.mergedProps.layoutId) {
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