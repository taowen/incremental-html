export { htmlVisualElement } from './motion/packages/framer-motion/types/render/html/visual-element'
export { createAnimationState } from './motion/packages/framer-motion/types/render/utils/animation-state';
export { animationControls } from './motion/packages/framer-motion/types/animation/animation-controls';
export { MotionProps } from "./motion/packages/framer-motion/types/motion/types"

import { MotionProps } from "./motion/packages/framer-motion/types/motion/types"
import { MotionContextProps } from "./motion/packages/framer-motion/types/context/MotionContext"
import { PresenceContextProps } from "./motion/packages/framer-motion/types/context/PresenceContext"
import { VisualState } from './motion/packages/framer-motion/types/motion/utils/use-visual-state';

export function makeVisualState(
    props: MotionProps,
    context: MotionContextProps,
    presenceContext: PresenceContextProps | null): VisualState<any, any>
