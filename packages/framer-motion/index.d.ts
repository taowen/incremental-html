export { htmlVisualElement } from './motion/packages/framer-motion/types/render/html/visual-element'
export { createAnimationState } from './motion/packages/framer-motion/types/render/utils/animation-state';
export { animationControls } from './motion/packages/framer-motion/types/animation/animation-controls';
export { MotionProps } from "./motion/packages/framer-motion/types/motion/types"
export { MotionContextProps } from "./motion/packages/framer-motion/types/context/MotionContext"
export { AnimationType } from './motion/packages/framer-motion/types/render/utils/types'
export { HTMLProjectionNode } from './motion/packages/framer-motion/types/projection/node/HTMLProjectionNode';
export { addPointerEvent } from './motion/packages/framer-motion/types/events/use-pointer-event';
export { EventListenerWithPointInfo } from './motion/packages/framer-motion/types/events/event-info';
export { VisualElementDragControls } from './motion/packages/framer-motion/types/gestures/drag/VisualElementDragControls';
import { MotionValue } from './motion/packages/framer-motion/types/value/index';

export function motionValue<T>(init: T): MotionValue<T>;

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

export function useHoverGesture(props: FeatureProps): () => void;
export function useTapGesture(props: FeatureProps): () => void;
export function useFocusGesture(props: FeatureProps): () => void;
export function useViewport(props: FeatureProps): () => void;

import { MotionConfigContext } from './motion/packages/framer-motion/types/context/MotionConfigContext';

export function usePanGesture(props: FeatureProps, { transformPagePoint }: MotionConfigContext): () => void;