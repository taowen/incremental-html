export { htmlVisualElement } from './motion/packages/framer-motion/types/render/html/visual-element'
export { createAnimationState } from './motion/packages/framer-motion/types/render/utils/animation-state';
export { animationControls } from './motion/packages/framer-motion/types/animation/animation-controls';
export { MotionProps } from "./motion/packages/framer-motion/types/motion/types"
export { AnimationType } from './motion/packages/framer-motion/types/render/utils/types'
export { HTMLProjectionNode } from './motion/packages/framer-motion/types/projection/node/HTMLProjectionNode';
export { addPointerEvent } from './motion/packages/framer-motion/types/events/use-pointer-event';
export { EventListenerWithPointInfo } from './motion/packages/framer-motion/types/events/event-info';

import { MotionProps } from "./motion/packages/framer-motion/types/motion/types"
import { MotionContextProps } from "./motion/packages/framer-motion/types/context/MotionContext"
import { PresenceContextProps } from "./motion/packages/framer-motion/types/context/PresenceContext"
import { VisualState } from './motion/packages/framer-motion/types/motion/utils/use-visual-state';

export function makeVisualState(
    props: MotionProps,
    context: MotionContextProps,
    presenceContext: PresenceContextProps | null): VisualState<any, any>

import { FeatureProps } from './motion/packages/framer-motion/types/motion/features/types'
import { LayoutGroupContextProps } from './motion/packages/framer-motion/types/context/LayoutGroupContext'
import { SwitchLayoutGroupContext } from './motion/packages/framer-motion/types/context/SwitchLayoutGroupContext'

interface MeasureContextProps {
    layoutGroup?: LayoutGroupContextProps
    switchLayoutGroup?: SwitchLayoutGroupContext
    isPresent: boolean
    safeToRemove?: VoidFunction | null
}

export const MeasureLayoutWithContext: {
    componentDidMount(props: FeatureProps & MeasureContextProps): void;
    getSnapshotBeforeUpdate(props: FeatureProps & MeasureContextProps, prevProps: FeatureProps & MeasureContextProps);
    componentDidUpdate(props: FeatureProps & MeasureContextProps);
    componentWillUnmount(props: FeatureProps & MeasureContextProps);
}

import { VisualElement } from './motion/packages/framer-motion/types/render/types'

export function useProjection(
    projectionId: number | undefined,
    { layoutId, layout, drag, dragConstraints, layoutScroll }: MotionProps,
    initialPromotionConfig: SwitchLayoutGroupContext,
    visualElement?: VisualElement,
    ProjectionNodeConstructor?: any
): void

import { EventInfo } from './motion/packages/framer-motion/types/events/types'

export function createHoverEvent(
    visualElement: VisualElement,
    isActive: boolean,
    callback?: (event: MouseEvent, info: EventInfo) => void
): (event: MouseEvent | TouchEvent | PointerEvent, info: EventInfo) => void

export function useTapGesture(props: FeatureProps): () => void;