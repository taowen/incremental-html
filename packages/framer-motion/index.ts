export { htmlVisualElement } from './motion/packages/framer-motion/src/render/html/visual-element'
export { createAnimationState } from './motion/packages/framer-motion/src/render/utils/animation-state';
export { animationControls } from './motion/packages/framer-motion/src/animation/animation-controls';
export { AnimationType } from './motion/packages/framer-motion/src/render/utils/types'

import { scrapeMotionValuesFromProps } from './motion/packages/framer-motion/src/render/html/utils/scrape-motion-values'
import { createHtmlRenderState } from './motion/packages/framer-motion/src/render/html/utils/create-render-state'
import { isAnimationControls } from './motion/packages/framer-motion/src/animation/utils/is-animation-controls';
import { ResolvedValues } from './motion/packages/framer-motion/src/render/types'
import { resolveMotionValue } from './motion/packages/framer-motion/src/value/utils/resolve-motion-value'
import {
    checkIfControllingVariants,
    checkIfVariantNode,
    resolveVariantFromProps,
} from "./motion/packages/framer-motion/src/render/utils/variants"
import { MotionContext, MotionContextProps } from "./motion/packages/framer-motion/src/context/MotionContext"
import { MotionProps } from "./motion/packages/framer-motion/src/motion/types"
import {
    PresenceContext,
    PresenceContextProps,
} from "./motion/packages/framer-motion/src/context/PresenceContext"
import { VisualState } from './motion/packages/framer-motion/src/motion/utils/use-visual-state';

export function makeVisualState(
    props: MotionProps,
    context: MotionContextProps,
    presenceContext: PresenceContextProps | null): VisualState<any, any> {
    const renderState = createHtmlRenderState();
    const state: VisualState<any, any> = {
        latestValues: makeLatestValues(
            props,
            context,
            presenceContext,
        ),
        renderState,
    }
    return state
}

function makeLatestValues(
    props: MotionProps,
    context: MotionContextProps,
    presenceContext: PresenceContextProps | null,
) {
    const values: ResolvedValues = {}
    const blockInitialAnimation = presenceContext?.initial === false

    const motionValues = scrapeMotionValuesFromProps(props)
    for (const key in motionValues) {
        values[key] = resolveMotionValue(motionValues[key])
    }

    let { initial, animate } = props
    const isControllingVariants = checkIfControllingVariants(props)
    const isVariantNode = checkIfVariantNode(props)

    if (
        context &&
        isVariantNode &&
        !isControllingVariants &&
        props.inherit !== false
    ) {
        initial ??= context.initial
        animate ??= context.animate
    }

    const initialAnimationIsBlocked = blockInitialAnimation || initial === false
    const variantToSet = initialAnimationIsBlocked ? animate : initial

    if (
        variantToSet &&
        typeof variantToSet !== "boolean" &&
        !isAnimationControls(variantToSet)
    ) {
        const list = Array.isArray(variantToSet) ? variantToSet : [variantToSet]
        list.forEach((definition) => {
            const resolved = resolveVariantFromProps(props, definition)
            if (!resolved) return

            const { transitionEnd, transition, ...target } = resolved

            for (const key in target) {
                let valueTarget = target[key]

                if (Array.isArray(valueTarget)) {
                    /**
                     * Take final keyframe if the initial animation is blocked because
                     * we want to initialise at the end of that blocked animation.
                     */
                    const index = initialAnimationIsBlocked
                        ? valueTarget.length - 1
                        : 0
                    valueTarget = valueTarget[index]
                }

                if (valueTarget !== null) {
                    values[key] = valueTarget
                }
            }
            for (const key in transitionEnd) values[key] = transitionEnd[key]
        })
    }

    return values
}