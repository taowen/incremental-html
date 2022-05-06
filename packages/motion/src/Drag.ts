import { makeVisualState, htmlVisualElement, animationControls, createAnimationState, MotionProps } from '@incremental-html/framer-motion';
import { Feature } from '@incremental-html/reactivity';
import { addPointerEvent } from './events';
import { Point } from './geometry';
import { PanInfo, PanSession } from './PanSession';
import { getStyle, setStyle } from './styler';

export class Drag extends Feature<{}> {
    // private originPoint: Point = { x: 0, y: 0 }
    private _ = this.effect(() => {
        const motionProps: MotionProps = {
            animate: {
                opacity: 0.5
            }
        };
        const visualState = makeVisualState(motionProps, {}, null);
        if (visualState.mount) {
            visualState.mount(this.element);
        }
        const visualElement = htmlVisualElement({
            visualState,
            props: motionProps
        });
        visualElement.animationState = createAnimationState(visualElement);
        visualElement.mount(this.element as HTMLElement);
        const controls = animationControls();
        const unsubscribe = (controls as any).subscribe(visualElement);
        controls.mount();
        return unsubscribe;
    })
    // constructor(private props: { element: HTMLElement, direction?: 'x' | 'y', constraints?: Element }) {
       
        // addPointerEvent(
        //     props.element,
        //     "pointerdown",
        //     (event) => {
        //         new PanSession(event, {
        //             onStart: (e, panInfo) => {
        //                 this.originPoint.x = getStyle(props.element, 'x');
        //                 this.originPoint.y = getStyle(props.element, 'y');
        //                 this.updatePosition(panInfo);
        //             },
        //             onMove: (e, panInfo) => {
        //                 this.updatePosition(panInfo);
        //             },
        //             onEnd: (e, panInfo) => {
        //                 this.updatePosition(panInfo);
        //                 if (this.props.constraints) {
        //                     if (getStyle(this.props.element, 'height') + getStyle(this.props.element, 'y') < getStyle(this.props.constraints, 'height')) {
        //                         setStyle(this.props.element, 'y', getStyle(this.props.constraints, 'height') - getStyle(this.props.element, 'height'))
        //                     }
        //                 }
        //             }
        //         })
        //     }
        // )
    // }

    // private updatePosition = (panInfo: PanInfo) => {
    //     if (this.props.direction === 'y') {
    //         setStyle(this.props.element, { y: this.originPoint.y + panInfo.offset.y });
    //     } else if (this.props.direction === 'x') {
    //         setStyle(this.props.element, { x: this.originPoint.x + panInfo.offset.x });
    //     } else {
    //         setStyle(this.props.element, { x: this.originPoint.x + panInfo.offset.x, y: this.originPoint.y + panInfo.offset.y });
    //     }
    // }
}