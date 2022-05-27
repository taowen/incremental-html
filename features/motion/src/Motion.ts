import { AnimationType, createAnimationState, HTMLProjectionNode, htmlVisualElement, makeVisualState, MeasureLayoutWithContext, MotionContextProps, MotionProps, useFocusGesture, useHoverGesture, usePanGesture, useProjection, useTapGesture, useViewport, VisualElementDragControls } from '@incremental-html/framer-motion';
import { closestFeature, Feature, nextTick, unmountElement } from '@incremental-html/reactivity';

class MotionConfig extends Feature<{ blockInitialAnimation?: boolean }> {
    public blockInitialAnimation = this.create(() => {
        if (localStorage.getItem('just-exit') === 'true') {
            localStorage.removeItem('just-exit');
            return false;
        }
        return this.props.blockInitialAnimation;
    });

    public async exit() {
        localStorage.setItem('just-exit', 'true');
        await unmountElement(this.element);
    }
}

export class Motion extends Feature<MotionProps> {
    public static Config = MotionConfig;
    private inheritedProps: MotionContextProps = this.create(() => {
        const parentMotion = closestFeature(this.element.parentElement, Motion);
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
        const config = closestFeature(this.element, MotionConfig);
        const blockInitialAnimation = !!config?.blockInitialAnimation;
        const visualState = makeVisualState(this.props, this.inheritedProps, {
            initial: !blockInitialAnimation
        } as any);
        const parent = closestFeature(this.element.parentElement, Motion)?.visualElement;
        const visualElement = htmlVisualElement({
            visualState,
            props: this.props,
            parent,
            blockInitialAnimation
        });
        visualElement.animationState = createAnimationState(visualElement);
        return visualElement;
    })
    public setLayoutAnimationBlocked(isBlocked: boolean) {
        this.visualElement.projection!.isAnimationBlocked = isBlocked;
        if (isBlocked) {
            this.visualElement.projection!.target = undefined;
        }
    }
    public get mergedProps(): any {
        return { ...this.props, ...this.inheritedProps, visualElement: this.visualElement }
    }
    public _1 = this.onMount(() => {
        useProjection(undefined, this.mergedProps, {}, this.visualElement, HTMLProjectionNode);
        if (this.mergedProps.drag && this.mergedProps.dragListener !== false) {
            Object.assign(this.element.style, {
                userSelect: 'none',
                touchAction: this.mergedProps.drag === true ? 'none' : `pan-${this.mergedProps.drag === "x" ? "y" : "x"}`
            })
        }
        this.visualElement.mount(this.element);
        new VisualElementDragControls(this.visualElement).addListeners();
        // when initial animation is disabled, we need to render the styles
        this.visualElement.syncRender();
        // need to wait for all projection nodes registered to root
        // then start layout animation to fix distortion using tree scale
        nextTick().then(() => {
            MeasureLayoutWithContext.componentDidMount(this.mergedProps);
        });
        const unmount = () => {
            MeasureLayoutWithContext.componentWillUnmount(this.mergedProps);
            this.visualElement.unmount();
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
        let parent = this.element;
        while (parent) {
            ancestors.push(parent);
            parent.addEventListener('beforeMorph', this.beforeMorph);
            parent.addEventListener('afterMorph', this.afterMorph);
            if (parent === document.body) {
                break;
            }
            parent = parent.parentElement!;
        }
        return () => {
            for (const parent of ancestors) {
                parent.removeEventListener('beforeMorph', this.beforeMorph);
                parent.removeEventListener('afterMorph', this.afterMorph);
            }
        }
    })
}