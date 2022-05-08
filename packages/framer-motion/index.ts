export { htmlVisualElement } from './motion/packages/framer-motion/src/render/html/visual-element'
export { createAnimationState } from './motion/packages/framer-motion/src/render/utils/animation-state';
export { animationControls } from './motion/packages/framer-motion/src/animation/animation-controls';
export { AnimationType } from './motion/packages/framer-motion/src/render/utils/types'
export { HTMLProjectionNode } from './motion/packages/framer-motion/src/projection/node/HTMLProjectionNode';
export { addPointerEvent } from './motion/packages/framer-motion/src/events/use-pointer-event';

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

import { LayoutGroupContextProps } from './motion/packages/framer-motion/src/context/LayoutGroupContext'
import { SwitchLayoutGroupContext } from './motion/packages/framer-motion/src/context/SwitchLayoutGroupContext'
import { FeatureProps } from './motion/packages/framer-motion/src/motion/features/types'
import { addScaleCorrector } from './motion/packages/framer-motion/src/projection/styles/scale-correction'
import { globalProjectionState } from './motion/packages/framer-motion/src/projection/node/create-projection-node'
import { correctBorderRadius } from './motion/packages/framer-motion/src/projection/styles/scale-border-radius'
import { correctBoxShadow } from './motion/packages/framer-motion/src/projection/styles/scale-box-shadow'
import sync from "framesync"

interface MeasureContextProps {
    layoutGroup?: LayoutGroupContextProps
    switchLayoutGroup?: SwitchLayoutGroupContext
    isPresent: boolean
    safeToRemove?: VoidFunction | null
}

export const MeasureLayoutWithContext = {
    /**
     * This only mounts projection nodes for components that
     * need measuring, we might want to do it for all components
     * in order to incorporate transforms
     */
    componentDidMount(props: FeatureProps & MeasureContextProps) {
        const { visualElement, layoutGroup, switchLayoutGroup, layoutId } = props
        const { projection } = visualElement

        addScaleCorrector(defaultScaleCorrectors)

        if (projection) {
            if (layoutGroup?.group) layoutGroup.group.add(projection)

            if (switchLayoutGroup?.register && layoutId) {
                switchLayoutGroup.register(projection)
            }

            projection.root!.didUpdate()
            projection.addEventListener("animationComplete", () => {
                this.safeToRemove(props)
            })
            projection.setOptions({
                ...projection.options,
                onExitComplete: () => this.safeToRemove(props),
            })
        }

        globalProjectionState.hasEverUpdated = true
    },

    getSnapshotBeforeUpdate(props: FeatureProps & MeasureContextProps, prevProps: FeatureProps & MeasureContextProps) {
        const { layoutDependency, visualElement, drag, isPresent } = props
        const projection = visualElement.projection

        if (!projection) return null

        /**
         * TODO: We use this data in relegate to determine whether to
         * promote a previous element. There's no guarantee its presence data
         * will have updated by this point - if a bug like this arises it will
         * have to be that we markForRelegation and then find a new lead some other way,
         * perhaps in didUpdate
         */
        projection.isPresent = isPresent

        if (
            drag ||
            prevProps.layoutDependency !== layoutDependency ||
            layoutDependency === undefined
        ) {
            projection.willUpdate()
        } else {
            this.safeToRemove(props)
        }

        if (prevProps.isPresent !== isPresent) {
            if (isPresent) {
                projection.promote()
            } else if (!projection.relegate()) {
                /**
                 * If there's another stack member taking over from this one,
                 * it's in charge of the exit animation and therefore should
                 * be in charge of the safe to remove. Otherwise we call it here.
                 */
                sync.postRender(() => {
                    if (!projection.getStack()?.members.length) {
                        this.safeToRemove(props)
                    }
                })
            }
        }

        return null
    },

    componentDidUpdate(props: FeatureProps & MeasureContextProps) {
        const { projection } = props.visualElement
        if (projection) {
            projection.root!.didUpdate()
            if (!projection.currentAnimation && projection.isLead()) {
                this.safeToRemove(props)
            }
        }
    },

    componentWillUnmount(props: FeatureProps & MeasureContextProps) {
        const {
            visualElement,
            layoutGroup,
            switchLayoutGroup: promoteContext,
        } = props
        const { projection } = visualElement

        if (projection) {
            projection.scheduleCheckAfterUnmount()
            if (layoutGroup?.group) layoutGroup.group.remove(projection)
            if (promoteContext?.deregister)
                promoteContext.deregister(projection)
        }
    },

    safeToRemove(props: FeatureProps & MeasureContextProps) {
        const { safeToRemove } = props
        safeToRemove?.()
    }
}

const defaultScaleCorrectors = {
    borderRadius: {
        ...correctBorderRadius,
        applyTo: [
            "borderTopLeftRadius",
            "borderTopRightRadius",
            "borderBottomLeftRadius",
            "borderBottomRightRadius",
        ],
    },
    borderTopLeftRadius: correctBorderRadius,
    borderTopRightRadius: correctBorderRadius,
    borderBottomLeftRadius: correctBorderRadius,
    borderBottomRightRadius: correctBorderRadius,
    boxShadow: correctBoxShadow,
}

import { VisualElement } from './motion/packages/framer-motion/src/render/types'
import { IProjectionNode } from './motion/packages/framer-motion/src/projection/node/types'

export function useProjection(
    projectionId: number | undefined,
    { layoutId, layout, drag, dragConstraints, layoutScroll }: MotionProps,
    initialPromotionConfig: SwitchLayoutGroupContext,
    visualElement?: VisualElement,
    ProjectionNodeConstructor?: any
): void {
    if (
        !ProjectionNodeConstructor ||
        !visualElement ||
        visualElement?.projection
    ) {
        return
    }

    visualElement.projection = new ProjectionNodeConstructor(
        projectionId,
        visualElement.getLatestValues(),
        visualElement.parent?.projection
    ) as IProjectionNode

    visualElement.projection.setOptions({
        layoutId,
        layout,
        alwaysMeasureLayout: false,
        visualElement,
        scheduleRender: () => visualElement.scheduleRender(),
        /**
         * TODO: Update options in an effect. This could be tricky as it'll be too late
         * to update by the time layout animations run.
         * We also need to fix this safeToRemove by linking it up to the one returned by usePresence,
         * ensuring it gets called if there's no potential layout animations.
         *
         */
        animationType: typeof layout === "string" ? layout : "both",
        initialPromotionConfig,
        layoutScroll,
    })
}

import { EventInfo } from './motion/packages/framer-motion/src/events/types'
import { isMouseEvent } from './motion/packages/framer-motion/src/gestures/utils/event-type'
import { isDragActive } from './motion/packages/framer-motion/src/gestures/drag/utils/lock'
import { AnimationType } from './motion/packages/framer-motion/src/render/utils/types'

export function createHoverEvent(
    visualElement: VisualElement,
    isActive: boolean,
    callback?: (event: MouseEvent, info: EventInfo) => void
) {
    return (event: MouseEvent | TouchEvent | PointerEvent, info: EventInfo) => {
        if (!isMouseEvent(event) || isDragActive()) return

        /**
         * Ensure we trigger animations before firing event callback
         */
        visualElement.animationState?.setActive(AnimationType.Hover, isActive)
        callback?.(event, info)
    }
}
import { isNodeOrChild } from "./motion/packages/framer-motion/src/gestures/utils/is-node-or-child"
import { pipe } from "popmotion"
import { addPointerEvent } from './motion/packages/framer-motion/src/events/use-pointer-event';

export function useTapGesture({
    onTap,
    onTapStart,
    onTapCancel,
    whileTap,
    visualElement,
}: FeatureProps) {
    const hasPressListeners = onTap || onTapStart || onTapCancel || whileTap
    let isPressing = false;
    let cancelPointerEndListeners: Function | null = null;

    function removePointerEndListener() {
        if(cancelPointerEndListeners) {
            cancelPointerEndListeners();
        }
        cancelPointerEndListeners = null;
    }

    function checkPointerEnd() {
        removePointerEndListener()
        isPressing = false
        visualElement.animationState?.setActive(AnimationType.Tap, false)
        return !isDragActive()
    }

    function onPointerUp(event: PointerEvent | MouseEvent | TouchEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        /**
         * We only count this as a tap gesture if the event.target is the same
         * as, or a child of, this component's element
         */
        !isNodeOrChild(visualElement.getInstance(), event.target as Element)
            ? onTapCancel?.(event, info)
            : onTap?.(event, info)
    }

    function onPointerCancel(event: PointerEvent | MouseEvent | TouchEvent, info: EventInfo) {
        if (!checkPointerEnd()) return

        onTapCancel?.(event, info)
    }

    function onPointerDown(event: PointerEvent | MouseEvent | TouchEvent, info: EventInfo) {
        removePointerEndListener()

        if (isPressing) return
        isPressing = true

        cancelPointerEndListeners = pipe(
            addPointerEvent(window, "pointerup", onPointerUp),
            addPointerEvent(window, "pointercancel", onPointerCancel)
        )

        /**
         * Ensure we trigger animations before firing event callback
         */
        visualElement.animationState?.setActive(AnimationType.Tap, true)

        onTapStart?.(event, info)
    }

    if (hasPressListeners) {
        addPointerEvent(
            visualElement.getInstance(),
            "pointerdown",
            onPointerDown
        )
    }

    return removePointerEndListener;
}