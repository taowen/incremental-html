/// <reference types="react" />

import { ComponentType } from 'react';
import { Context } from 'react';
import { CSSProperties } from 'react';
import { Easing as Easing_2 } from 'popmotion';
import { Process } from 'framesync';
import * as React_2 from 'react';
import { RefObject } from 'react';
import { SVGAttributes } from 'react';

export declare function addPointerEvent(target: EventTarget, eventName: string, handler: EventListenerWithPointInfo, options?: AddEventListenerOptions): () => void;

/**
 * Animate a single value or a `MotionValue`.
 *
 * The first argument is either a `MotionValue` to animate, or an initial animation value.
 *
 * The second is either a value to animate to, or an array of keyframes to animate through.
 *
 * The third argument can be either tween or spring options, and optional lifecycle methods: `onUpdate`, `onPlay`, `onComplete`, `onRepeat` and `onStop`.
 *
 * Returns `AnimationPlaybackControls`, currently just a `stop` method.
 *
 * ```javascript
 * const x = useMotionValue(0)
 *
 * useEffect(() => {
 *   const controls = animate(x, 100, {
 *     type: "spring",
 *     stiffness: 2000,
 *     onComplete: v => {}
 *   })
 *
 *   return controls.stop
 * })
 * ```
 *
 * @public
 */
export declare function animate<V>(from: MotionValue<V> | V, to: V | V[], transition?: AnimationOptions_2<V>): AnimationPlaybackControls;

declare type AnimationCompleteListener = (definition: AnimationDefinition) => void;

/**
 * @public
 */
declare interface AnimationControls {
    /**
     * Subscribes a component's animation controls to this.
     *
     * @param controls - The controls to subscribe
     * @returns An unsubscribe function.
     *
     * @internal
     */
    subscribe(visualElement: VisualElement): () => void;
    /**
     * Starts an animation on all linked components.
     *
     * @remarks
     *
     * ```jsx
     * controls.start("variantLabel")
     * controls.start({
     *   x: 0,
     *   transition: { duration: 1 }
     * })
     * ```
     *
     * @param definition - Properties or variant label to animate to
     * @param transition - Optional `transtion` to apply to a variant
     * @returns - A `Promise` that resolves when all animations have completed.
     *
     * @public
     */
    start(definition: ControlsAnimationDefinition, transitionOverride?: Transition): Promise<any>;
    /**
     * Instantly set to a set of properties or a variant.
     *
     * ```jsx
     * // With properties
     * controls.set({ opacity: 0 })
     *
     * // With variants
     * controls.set("hidden")
     * ```
     *
     * @internalremarks
     * We could perform a similar trick to `.start` where this can be called before mount
     * and we maintain a list of of pending actions that get applied on mount. But the
     * expectation of `set` is that it happens synchronously and this would be difficult
     * to do before any children have even attached themselves. It's also poor practise
     * and we should discourage render-synchronous `.start` calls rather than lean into this.
     *
     * @public
     */
    set(definition: ControlsAnimationDefinition): void;
    /**
     * Stops animations on all linked components.
     *
     * ```jsx
     * controls.stop()
     * ```
     *
     * @public
     */
    stop(): void;
    mount(): () => void;
}

/**
 * @public
 */
export declare function animationControls(): AnimationControls;

declare type AnimationDefinition = VariantLabels | TargetAndTransition | TargetResolver;

declare interface AnimationLifecycles {
    /**
     * Callback with latest motion values, fired max once per frame.
     *
     * ```jsx
     * function onUpdate(latest) {
     *   console.log(latest.x, latest.opacity)
     * }
     *
     * <motion.div animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * ```
     */
    onUpdate?(latest: ResolvedValues): void;
    /**
     * Callback when animation defined in `animate` begins.
     *
     * The provided callback will be called with the triggering animation definition.
     * If this is a variant, it'll be the variant name, and if a target object
     * then it'll be the target object.
     *
     * This way, it's possible to figure out which animation has started.
     *
     * ```jsx
     * function onStart() {
     *   console.log("Animation started")
     * }
     *
     * <motion.div animate={{ x: 100 }} onAnimationStart={onStart} />
     * ```
     */
    onAnimationStart?(definition: AnimationDefinition): void;
    /**
     * Callback when animation defined in `animate` is complete.
     *
     * The provided callback will be called with the triggering animation definition.
     * If this is a variant, it'll be the variant name, and if a target object
     * then it'll be the target object.
     *
     * This way, it's possible to figure out which animation has completed.
     *
     * ```jsx
     * function onComplete() {
     *   console.log("Animation completed")
     * }
     *
     * <motion.div
     *   animate={{ x: 100 }}
     *   onAnimationComplete={definition => {
     *     console.log('Completed animating', definition)
     *   }}
     * />
     * ```
     */
    onAnimationComplete?(definition: AnimationDefinition): void;
    /**
     * @internal
     */
    onUnmount?(): void;
}

declare type AnimationOptions = {
    delay?: number;
    transitionOverride?: Transition;
    custom?: any;
    type?: AnimationType;
};

/**
 * @public
 */
declare type AnimationOptions_2<V> = (Tween | Spring) & AnimationPlaybackLifecycles<V> & {
    delay?: number;
    type?: "tween" | "spring";
};

/**
 * @public
 */
declare interface AnimationPlaybackControls {
    stop: () => void;
    isAnimating: () => boolean;
}

/**
 * @public
 */
declare interface AnimationPlaybackLifecycles<V> {
    onUpdate?: (latest: V) => void;
    onPlay?: () => void;
    onComplete?: () => void;
    onRepeat?: () => void;
    onStop?: () => void;
}

/**
 * @public
 */
declare interface AnimationProps {
    /**
     * Values to animate to, variant label(s), or `AnimationControls`.
     *
     * ```jsx
     * // As values
     * <motion.div animate={{ opacity: 1 }} />
     *
     * // As variant
     * <motion.div animate="visible" variants={variants} />
     *
     * // Multiple variants
     * <motion.div animate={["visible", "active"]} variants={variants} />
     *
     * // AnimationControls
     * <motion.div animate={animation} />
     * ```
     */
    animate?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
    /**
     * A target to animate to when this component is removed from the tree.
     *
     * This component **must** be the first animatable child of an `AnimatePresence` to enable this exit animation.
     *
     * This limitation exists because React doesn't allow components to defer unmounting until after
     * an animation is complete. Once this limitation is fixed, the `AnimatePresence` component will be unnecessary.
     *
     * ```jsx
     * import { AnimatePresence, motion } from 'framer-motion'
     *
     * export const MyComponent = ({ isVisible }) => {
     *   return (
     *     <AnimatePresence>
     *        {isVisible && (
     *          <motion.div
     *            initial={{ opacity: 0 }}
     *            animate={{ opacity: 1 }}
     *            exit={{ opacity: 0 }}
     *          />
     *        )}
     *     </AnimatePresence>
     *   )
     * }
     * ```
     */
    exit?: TargetAndTransition | VariantLabels;
    /**
     * Variants allow you to define animation states and organise them by name. They allow
     * you to control animations throughout a component tree by switching a single `animate` prop.
     *
     * Using `transition` options like `delayChildren` and `staggerChildren`, you can orchestrate
     * when children animations play relative to their parent.

     *
     * After passing variants to one or more `motion` component's `variants` prop, these variants
     * can be used in place of values on the `animate`, `initial`, `whileFocus`, `whileTap` and `whileHover` props.
     *
     * ```jsx
     * const variants = {
     *   active: {
     *       backgroundColor: "#f00"
     *   },
     *   inactive: {
     *     backgroundColor: "#fff",
     *     transition: { duration: 2 }
     *   }
     * }
     *
     * <motion.div variants={variants} animate="active" />
     * ```
     */
    variants?: Variants;
    /**
     * Default transition. If no `transition` is defined in `animate`, it will use the transition defined here.
     * ```jsx
     * const spring = {
     *   type: "spring",
     *   damping: 10,
     *   stiffness: 100
     * }
     *
     * <motion.div transition={spring} animate={{ scale: 1.2 }} />
     * ```
     */
    transition?: Transition;
}

declare type AnimationStartListener = (definition: AnimationDefinition) => void;

declare interface AnimationState {
    animateChanges: (options?: AnimationOptions, type?: AnimationType) => Promise<any>;
    setActive: (type: AnimationType, isActive: boolean, options?: AnimationOptions) => Promise<any>;
    setAnimateFunction: (fn: any) => void;
    isAnimated(key: string): boolean;
    getState: () => {
        [key: string]: AnimationTypeState;
    };
}

export declare enum AnimationType {
    Animate = "animate",
    Hover = "whileHover",
    Tap = "whileTap",
    Drag = "whileDrag",
    Focus = "whileFocus",
    InView = "whileInView",
    Exit = "exit"
}

declare interface AnimationTypeState {
    isActive: boolean;
    protectedKeys: {
        [key: string]: true;
    };
    needsAnimating: {
        [key: string]: boolean;
    };
    prevResolvedValues: {
        [key: string]: any;
    };
    prevProp?: VariantLabels | TargetAndTransition;
}

declare type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent;

export declare interface Axis {
    min: number;
    max: number;
}

export declare interface AxisDelta {
    translate: number;
    scale: number;
    origin: number;
    originPoint: number;
}

declare type BeforeLayoutMeasureListener = () => void;

export declare interface BoundingBox {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export declare interface Box {
    x: Axis;
    y: Axis;
}

/**
 * @public
 */
declare type ControlsAnimationDefinition = string | string[] | TargetAndTransition | TargetResolver;

export declare function createAnimationState(visualElement: VisualElement): AnimationState;

declare type CSSPropertiesWithoutTransitionOrSingleTransforms = Omit_2<CSSProperties, "transition" | "rotate" | "scale" | "perspective">;

declare interface CustomStyles {
    /**
     * Framer Library custom prop types. These are not actually supported in Motion - preferably
     * we'd have a way of external consumers injecting supported styles into this library.
     */
    size?: string | number;
    radius?: string | number;
    shadow?: string;
    image?: string;
}

/**
 * @public
 */
declare interface CustomValueType {
    mix: (from: any, to: any) => (p: number) => number | string;
    toValue: () => number | string;
}

export declare interface Delta {
    x: AxisDelta;
    y: AxisDelta;
}

declare interface DOMVisualElementOptions {
    /**
     * A function that can map a page point between spaces. Used by Framer
     * to support dragging and layout animations within scaled space.
     *
     * @public
     */
    transformPagePoint?: TransformPoint;
    /**
     * Allow `transform` to be set as `"none"` if all transforms are their default
     * values. Switching to this removes the element as a GPU layer which can lead to subtle
     * graphical shifts.
     *
     * @public
     */
    allowTransformNone?: boolean;
    /**
     * Allow this element to be GPU-accelerated. We currently enable this by
     * adding a `translateZ(0)`.
     *
     * @public
     */
    enableHardwareAcceleration?: boolean;
}

declare interface DragControlOptions {
    snapToCursor?: boolean;
    cursorProgress?: Point;
}

/**
 * Can manually trigger a drag gesture on one or more `drag`-enabled `motion` components.
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <div onPointerDown={startDrag} />
 *     <motion.div drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @public
 */
declare class DragControls {
    private componentControls;
    /**
     * Subscribe a component's internal `VisualElementDragControls` to the user-facing API.
     *
     * @internal
     */
    subscribe(controls: VisualElementDragControls): () => void;
    /**
     * Start a drag gesture on every `motion` component that has this set of drag controls
     * passed into it via the `dragControls` prop.
     *
     * ```jsx
     * dragControls.start(e, {
     *   snapToCursor: true
     * })
     * ```
     *
     * @param event - PointerEvent
     * @param options - Options
     *
     * @public
     */
    start(event: React_2.MouseEvent | React_2.TouchEvent | React_2.PointerEvent | MouseEvent | TouchEvent | PointerEvent, options?: DragControlOptions): void;
}

declare type DragElastic = boolean | number | Partial<BoundingBox>;

/**
 * @public
 */
declare interface DraggableProps extends DragHandlers {
    /**
     * Enable dragging for this element. Set to `false` by default.
     * Set `true` to drag in both directions.
     * Set `"x"` or `"y"` to only drag in a specific direction.
     *
     * ```jsx
     * <motion.div drag="x" />
     * ```
     */
    drag?: boolean | "x" | "y";
    /**
     * Properties or variant label to animate to while the drag gesture is recognised.
     *
     * ```jsx
     * <motion.div whileDrag={{ scale: 1.2 }} />
     * ```
     */
    whileDrag?: VariantLabels | TargetAndTransition;
    /**
     * If `true`, this will lock dragging to the initially-detected direction. Defaults to `false`.
     *
     * ```jsx
     * <motion.div drag dragDirectionLock />
     * ```
     */
    dragDirectionLock?: boolean;
    /**
     * Allows drag gesture propagation to child components. Set to `false` by
     * default.
     *
     * ```jsx
     * <motion.div drag="x" dragPropagation />
     * ```
     */
    dragPropagation?: boolean;
    /**
     * Applies constraints on the permitted draggable area.
     *
     * It can accept an object of optional `top`, `left`, `right`, and `bottom` values, measured in pixels.
     * This will define a distance the named edge of the draggable component.
     *
     * Alternatively, it can accept a `ref` to another component created with React's `useRef` hook.
     * This `ref` should be passed both to the draggable component's `dragConstraints` prop, and the `ref`
     * of the component you want to use as constraints.
     *
     * ```jsx
     * // In pixels
     * <motion.div
     *   drag="x"
     *   dragConstraints={{ left: 0, right: 300 }}
     * />
     *
     * // As a ref to another component
     * const MyComponent = () => {
     *   const constraintsRef = useRef(null)
     *
     *   return (
     *      <motion.div ref={constraintsRef}>
     *          <motion.div drag dragConstraints={constraintsRef} />
     *      </motion.div>
     *   )
     * }
     * ```
     */
    dragConstraints?: false | Partial<BoundingBox> | RefObject<Element>;
    /**
     * The degree of movement allowed outside constraints. 0 = no movement, 1 =
     * full movement.
     *
     * Set to `0.5` by default. Can also be set as `false` to disable movement.
     *
     * By passing an object of `top`/`right`/`bottom`/`left`, individual values can be set
     * per constraint. Any missing values will be set to `0`.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragElastic={0.2}
     * />
     * ```
     */
    dragElastic?: DragElastic;
    /**
     * Apply momentum from the pan gesture to the component when dragging
     * finishes. Set to `true` by default.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragMomentum={false}
     * />
     * ```
     */
    dragMomentum?: boolean;
    /**
     * Allows you to change dragging inertia parameters.
     * When releasing a draggable Frame, an animation with type `inertia` starts. The animation is based on your dragging velocity. This property allows you to customize it.
     * See {@link https://framer.com/api/animation/#inertia | Inertia} for all properties you can use.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
     * />
     * ```
     */
    dragTransition?: InertiaOptions;
    /**
     * Usually, dragging is initiated by pressing down on a component and moving it. For some
     * use-cases, for instance clicking at an arbitrary point on a video scrubber, we
     * might want to initiate dragging from a different component than the draggable one.
     *
     * By creating a `dragControls` using the `useDragControls` hook, we can pass this into
     * the draggable component's `dragControls` prop. It exposes a `start` method
     * that can start dragging from pointer events on other components.
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <div onPointerDown={startDrag} />
     *     <motion.div drag="x" dragControls={dragControls} />
     *   </>
     * )
     * ```
     */
    dragControls?: DragControls;
    /**
     * If true, element will snap back to its origin when dragging ends.
     *
     * Enabling this is the equivalent of setting all `dragConstraints` axes to `0`
     * with `dragElastic={1}`, but when used together `dragConstraints` can define
     * a wider draggable area and `dragSnapToOrigin` will ensure the element
     * animates back to its origin on release.
     */
    dragSnapToOrigin?: boolean;
    /**
     * By default, if `drag` is defined on a component then an event listener will be attached
     * to automatically initiate dragging when a user presses down on it.
     *
     * By setting `dragListener` to `false`, this event listener will not be created.
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <div onPointerDown={startDrag} />
     *     <motion.div
     *       drag="x"
     *       dragControls={dragControls}
     *       dragListener={false}
     *     />
     *   </>
     * )
     * ```
     */
    dragListener?: boolean;
    /**
     * If `dragConstraints` is set to a React ref, this callback will call with the measured drag constraints.
     *
     * @public
     */
    onMeasureDragConstraints?: (constraints: BoundingBox) => BoundingBox | void;
    /**
     * Usually, dragging uses the layout project engine, and applies transforms to the underlying VisualElement.
     * Passing MotionValues as _dragX and _dragY instead applies drag updates to these motion values.
     * This allows you to manually control how updates from a drag gesture on an element is applied.
     *
     * @public
     */
    _dragX?: MotionValue<number>;
    /**
     * Usually, dragging uses the layout project engine, and applies transforms to the underlying VisualElement.
     * Passing MotionValues as _dragX and _dragY instead applies drag updates to these motion values.
     * This allows you to manually control how updates from a drag gesture on an element is applied.
     *
     * @public
     */
    _dragY?: MotionValue<number>;
}

/**
 * @public
 */
declare interface DragHandlers {
    /**
     * Callback function that fires when dragging starts.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDragStart={
     *     (event, info) => console.log(info.point.x, info.point.y)
     *   }
     * />
     * ```
     *
     * @public
     */
    onDragStart?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires when dragging ends.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDragEnd={
     *     (event, info) => console.log(info.point.x, info.point.y)
     *   }
     * />
     * ```
     *
     * @public
     */
    onDragEnd?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires when the component is dragged.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDrag={
     *     (event, info) => console.log(info.point.x, info.point.y)
     *   }
     * />
     * ```
     *
     * @public
     */
    onDrag?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires a drag direction is determined.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragDirectionLock
     *   onDirectionLock={axis => console.log(axis)}
     * />
     * ```
     *
     * @public
     */
    onDirectionLock?(axis: "x" | "y"): void;
    /**
     * Callback function that fires when drag momentum/bounce transition finishes.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDragTransitionEnd={() => console.log('Drag transition complete')}
     * />
     * ```
     *
     * @public
     */
    onDragTransitionEnd?(): void;
}

/**
 * The easing function to use. Set as one of:
 *
 * - The name of an in-built easing function.
 * - An array of four numbers to define a cubic bezier curve.
 * - An easing function, that accepts and returns a progress value between `0` and `1`.
 *
 * @public
 */
declare type Easing = [number, number, number, number] | "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut" | "anticipate" | EasingFunction;

/**
 * A function that accepts a progress value between `0` and `1` and returns a
 * new one.
 *
 * ```jsx
 * <motion.div
 *   animate={{ opacity: 0 }}
 *   transition={{
 *     duration: 1,
 *     ease: progress => progress * progress
 *   }}
 * />
 * ```
 *
 * @public
 */
declare type EasingFunction = (v: number) => number;

/** @public */
declare interface EventInfo {
    point: Point;
}

export declare type EventListenerWithPointInfo = (e: MouseEvent | TouchEvent | PointerEvent, info: EventInfo) => void;

/**
 * @public
 */
declare interface FeatureProps extends MotionProps {
    visualElement: VisualElement;
}

declare class FlatTree {
    private children;
    private isDirty;
    add(child: WithDepth): void;
    remove(child: WithDepth): void;
    forEach(callback: (child: WithDepth) => void): void;
}

/**
 * @public
 */
declare interface FocusHandlers {
    /**
     * Properties or variant label to animate to while the focus gesture is recognised.
     *
     * ```jsx
     * <motion.input whileFocus={{ scale: 1.2 }} />
     * ```
     */
    whileFocus?: VariantLabels | TargetAndTransition;
}

declare type GenericHandler = (...args: any) => void;

/**
 * @public
 */
declare interface HoverHandlers {
    /**
     * Properties or variant label to animate to while the hover gesture is recognised.
     *
     * ```jsx
     * <motion.div whileHover={{ scale: 1.2 }} />
     * ```
     */
    whileHover?: VariantLabels | TargetAndTransition;
    /**
     * Callback function that fires when pointer starts hovering over the component.
     *
     * ```jsx
     * <motion.div onHoverStart={() => console.log('Hover starts')} />
     * ```
     */
    onHoverStart?(event: MouseEvent, info: EventInfo): void;
    /**
     * Callback function that fires when pointer stops hovering over the component.
     *
     * ```jsx
     * <motion.div onHoverEnd={() => console.log("Hover ends")} />
     * ```
     */
    onHoverEnd?(event: MouseEvent, info: EventInfo): void;
}

export declare const HTMLProjectionNode: {
    new (id: number | undefined, latestValues?: ResolvedValues, parent?: IProjectionNode<unknown> | undefined): {
        id: number | undefined;
        instance: HTMLElement;
        root: IProjectionNode<unknown>;
        parent?: IProjectionNode<unknown> | undefined;
        path: IProjectionNode<unknown>[];
        children: Set<IProjectionNode<unknown>>;
        options: ProjectionNodeOptions;
        snapshot: Snapshot | undefined;
        layout: Layout | undefined;
        targetLayout?: Box | undefined;
        layoutCorrected: Box;
        targetDelta?: Delta | undefined;
        target?: Box | undefined;
        relativeTarget?: Box | undefined;
        relativeTargetOrigin?: Box | undefined;
        relativeParent?: IProjectionNode<unknown> | undefined;
        isTreeAnimating: boolean;
        isAnimationBlocked: boolean;
        attemptToResolveRelativeTarget?: boolean | undefined;
        targetWithTransforms?: Box | undefined;
        projectionDelta?: Delta | undefined;
        projectionDeltaWithTransform?: Delta | undefined;
        scroll?: Point | undefined;
        isLayoutDirty: boolean;
        updateManuallyBlocked: boolean;
        updateBlockedByResize: boolean;
        isUpdating: boolean;
        isSVG: boolean;
        needsReset: boolean;
        shouldResetTransform: boolean;
        treeScale: Point;
        resumeFrom?: IProjectionNode<unknown> | undefined;
        resumingFrom?: IProjectionNode<unknown> | undefined;
        latestValues: ResolvedValues;
        eventHandlers: Map<LayoutEvents, SubscriptionManager<any>>;
        nodes?: FlatTree | undefined;
        depth: number;
        projectionTransform: string;
        prevTransformTemplateValue: string | undefined;
        preserveOpacity?: boolean | undefined;
        addEventListener(name: LayoutEvents, handler: any): () => void;
        notifyListeners(name: LayoutEvents, ...args: any): void;
        hasListeners(name: LayoutEvents): boolean;
        potentialNodes: Map<number, IProjectionNode<unknown>>;
        registerPotentialNode(id: number, node: IProjectionNode<unknown>): void;
        mount(instance: HTMLElement, isLayoutDirty?: boolean): void;
        unmount(): void;
        blockUpdate(): void;
        unblockUpdate(): void;
        isUpdateBlocked(): boolean;
        isTreeAnimationBlocked(): boolean;
        startUpdate(): void;
        willUpdate(shouldNotifyListeners?: boolean): void;
        didUpdate(): void;
        clearAllSnapshots(): void;
        scheduleUpdateProjection(): void;
        scheduleCheckAfterUnmount(): void;
        checkUpdateFailed: () => void;
        updateProjection: () => void;
        updateSnapshot(): void;
        updateLayout(): void;
        updateScroll(): void;
        resetTransform(): void;
        measure(): Box;
        removeElementScroll(box: Box): Box;
        applyTransform(box: Box, transformOnly?: boolean): Box;
        removeTransform(box: Box): Box;
        setTargetDelta(delta: Delta): void;
        setOptions(options: ProjectionNodeOptions): void;
        clearMeasurements(): void;
        resolveTargetDelta(): void;
        getClosestProjectingParent(): IProjectionNode<unknown> | undefined;
        hasProjected: boolean;
        calcProjection(): void;
        isVisible: boolean;
        hide(): void;
        show(): void;
        scheduleRender(notifyAll?: boolean): void;
        animationValues?: ResolvedValues | undefined;
        pendingAnimation?: Process | undefined;
        currentAnimation?: AnimationPlaybackControls | undefined;
        mixTargetDelta: (progress: number) => void;
        animationProgress: number;
        setAnimationOrigin(delta: Delta, hasOnlyRelativeTargetChanged?: boolean): void;
        startAnimation(options: AnimationOptions_2<number>): void;
        completeAnimation(): void;
        finishAnimation(): void;
        applyTransformsToTarget(): void;
        sharedNodes: Map<string, NodeStack>;
        registerSharedNode(layoutId: string, node: IProjectionNode<unknown>): void;
        isLead(): boolean;
        getLead(): IProjectionNode<unknown> | any;
        getPrevLead(): IProjectionNode<unknown> | undefined;
        getStack(): NodeStack | undefined;
        promote({ needsReset, transition, preserveFollowOpacity, }?: {
            needsReset?: boolean | undefined;
            transition?: Transition | undefined;
            preserveFollowOpacity?: boolean | undefined;
        }): void;
        relegate(): boolean;
        resetRotation(): void;
        getProjectionStyles(styleProp?: MotionStyle): ResolvedValues;
        clearSnapshot(): void;
        resetTree(): void;
    };
};

export declare const htmlVisualElement: ({ parent, props, presenceId, blockInitialAnimation, visualState, shouldReduceMotion, }: VisualElementOptions<HTMLElement, any>, options?: DOMVisualElementOptions) => VisualElement<HTMLElement, any>;

/**
 * An animation that decelerates a value based on its initial velocity,
 * usually used to implement inertial scrolling.
 *
 * Optionally, `min` and `max` boundaries can be defined, and inertia
 * will snap to these with a spring animation.
 *
 * This animation will automatically precalculate a target value,
 * which can be modified with the `modifyTarget` property.
 *
 * This allows you to add snap-to-grid or similar functionality.
 *
 * Inertia is also the animation used for `dragTransition`, and can be configured via that prop.
 *
 * @public
 */
declare interface Inertia {
    /**
     * Set `type` to animate using the inertia animation. Set to `"tween"` by
     * default. This can be used for natural deceleration, like momentum scrolling.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: "inertia", velocity: 50 }}
     * />
     * ```
     *
     * @public
     */
    type: "inertia";
    /**
     * A function that receives the automatically-calculated target and returns a new one. Useful for snapping the target to a grid.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{
     *     power: 0,
     *     // Snap calculated target to nearest 50 pixels
     *     modifyTarget: target => Math.round(target / 50) * 50
     *   }}
     * />
     * ```
     *
     * @public
     */
    modifyTarget?(v: number): number;
    /**
     * If `min` or `max` is set, this affects the stiffness of the bounce
     * spring. Higher values will create more sudden movement. Set to `500` by
     * default.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{
     *     min: 0,
     *     max: 100,
     *     bounceStiffness: 100
     *   }}
     * />
     * ```
     *
     * @public
     */
    bounceStiffness?: number;
    /**
     * If `min` or `max` is set, this affects the damping of the bounce spring.
     * If set to `0`, spring will oscillate indefinitely. Set to `10` by
     * default.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{
     *     min: 0,
     *     max: 100,
     *     bounceDamping: 8
     *   }}
     * />
     * ```
     *
     * @public
     */
    bounceDamping?: number;
    /**
     * A higher power value equals a further target. Set to `0.8` by default.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ power: 0.2 }}
     * />
     * ```
     *
     * @public
     */
    power?: number;
    /**
     * Adjusting the time constant will change the duration of the
     * deceleration, thereby affecting its feel. Set to `700` by default.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ timeConstant: 200 }}
     * />
     * ```
     *
     * @public
     */
    timeConstant?: number;
    /**
     * End the animation if the distance to the animation target is below this value, and the absolute speed is below `restSpeed`.
     * When the animation ends, the value gets snapped to the animation target. Set to `0.01` by default.
     * Generally the default values provide smooth animation endings, only in rare cases should you need to customize these.
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ restDelta: 10 }}
     * />
     * ```
     *
     * @public
     */
    restDelta?: number;
    /**
     * Minimum constraint. If set, the value will "bump" against this value (or immediately spring to it if the animation starts as less than this value).
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ min: 0, max: 100 }}
     * />
     * ```
     *
     * @public
     */
    min?: number;
    /**
     * Maximum constraint. If set, the value will "bump" against this value (or immediately snap to it, if the initial animation value exceeds this value).
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ min: 0, max: 100 }}
     * />
     * ```
     *
     * @public
     */
    max?: number;
    /**
     * The value to animate from. By default, this is the current state of the animating value.
     *
     * ```jsx
     * <Frame
     *   drag
     *   dragTransition={{ from: 50 }}
     * />
     * ```
     *
     * @public
     */
    from?: number | string;
    /**
     * The initial velocity of the animation.
     * By default this is the current velocity of the component.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'inertia', velocity: 200 }}
     * />
     * ```
     *
     * @public
     */
    velocity?: number;
    /**
     * @internal
     */
    delay?: number;
}

/**
 * @public
 */
declare type InertiaOptions = Partial<Omit<Inertia, "velocity" | "type">>;

declare type InitialPromotionConfig = {
    /**
     * The initial transition to use when the elements in this group mount (and automatically promoted).
     * Subsequent updates should provide a transition in the promote method.
     */
    transition?: Transition;
    /**
     * If the follow tree should preserve its opacity when the lead is promoted on mount
     */
    shouldPreserveFollowOpacity?: (member: IProjectionNode) => boolean;
};

declare type InputRange = number[];

declare interface IProjectionNode<I = unknown> {
    id: number | undefined;
    parent?: IProjectionNode;
    relativeParent?: IProjectionNode;
    root?: IProjectionNode;
    children: Set<IProjectionNode>;
    path: IProjectionNode[];
    nodes?: FlatTree;
    depth: number;
    instance: I;
    mount: (node: I, isLayoutDirty?: boolean) => void;
    unmount: () => void;
    options: ProjectionNodeOptions;
    setOptions(options: ProjectionNodeOptions): void;
    layout?: Layout;
    snapshot?: Snapshot;
    target?: Box;
    relativeTarget?: Box;
    targetDelta?: Delta;
    targetWithTransforms?: Box;
    scroll?: Point;
    treeScale?: Point;
    projectionDelta?: Delta;
    latestValues: ResolvedValues;
    isLayoutDirty: boolean;
    shouldResetTransform: boolean;
    prevTransformTemplateValue: string | undefined;
    isUpdateBlocked(): boolean;
    updateManuallyBlocked: boolean;
    updateBlockedByResize: boolean;
    blockUpdate(): void;
    unblockUpdate(): void;
    isUpdating: boolean;
    needsReset: boolean;
    startUpdate(): void;
    willUpdate(notifyListeners?: boolean): void;
    didUpdate(): void;
    measure(): Box;
    updateLayout(): void;
    updateSnapshot(): void;
    clearSnapshot(): void;
    updateScroll(): void;
    scheduleUpdateProjection(): void;
    scheduleCheckAfterUnmount(): void;
    checkUpdateFailed(): void;
    potentialNodes: Map<number, IProjectionNode>;
    sharedNodes: Map<string, NodeStack>;
    registerPotentialNode(id: number, node: IProjectionNode): void;
    registerSharedNode(id: string, node: IProjectionNode): void;
    getStack(): NodeStack | undefined;
    isVisible: boolean;
    hide(): void;
    show(): void;
    scheduleRender(notifyAll?: boolean): void;
    getClosestProjectingParent(): IProjectionNode | undefined;
    setTargetDelta(delta: Delta): void;
    resetTransform(): void;
    resetRotation(): void;
    applyTransform(box: Box, transformOnly?: boolean): Box;
    resolveTargetDelta(): void;
    calcProjection(): void;
    getProjectionStyles(styles?: MotionStyle): MotionStyle | undefined;
    clearMeasurements(): void;
    resetTree(): void;
    animationValues?: ResolvedValues;
    currentAnimation?: AnimationPlaybackControls;
    isTreeAnimating?: boolean;
    isAnimationBlocked?: boolean;
    isTreeAnimationBlocked: () => boolean;
    setAnimationOrigin(delta: Delta): void;
    startAnimation(transition: Transition): void;
    finishAnimation(): void;
    isLead(): boolean;
    promote(options?: {
        needsReset?: boolean;
        transition?: Transition;
        preserveFollowOpacity?: boolean;
    }): void;
    relegate(): boolean;
    resumeFrom?: IProjectionNode;
    resumingFrom?: IProjectionNode;
    isPresent?: boolean;
    addEventListener(name: LayoutEvents, handler: any): VoidFunction;
    notifyListeners(name: LayoutEvents, ...args: any): void;
    hasListeners(name: LayoutEvents): boolean;
    preserveOpacity?: boolean;
}

export declare const isMotionValue: (value: any) => value is MotionValue<any>;

export declare function isSVGComponent(Component: string | ComponentType): boolean;

/**
 * @internal
 */
declare interface Just {
    type: "just";
    to?: number | string | ValueTarget;
    from?: number | string;
    delay?: number;
    velocity?: number;
}

/**
 * Keyframes tweens between multiple `values`.
 *
 * These tweens can be arranged using the `duration`, `easings`, and `times` properties.
 *
 * @internalremarks
 * We could possibly make the `type` property redundant, if not for all animations
 * then for this one quite easily.
 *
 * @internal
 */
declare interface Keyframes {
    /**
     * Set `type` to `"keyframes"` to animate using the keyframes animation.
     * Set to `"tween"` by default. This can be used to animate between a series of values.
     *
     * @public
     */
    type: "keyframes";
    /**
     * An array of values to animate between.
     *
     * @internal
     */
    values: KeyframesTarget;
    /**
     * An array of numbers between 0 and 1, where `1` represents the `total` duration.
     *
     * Each value represents at which point during the animation each item in the animation target should be hit, so the array should be the same length as `values`.
     *
     * Defaults to an array of evenly-spread durations.
     *
     * @public
     */
    times?: number[];
    /**
     * An array of easing functions for each generated tween, or a single easing function applied to all tweens.
     *
     * This array should be one item less than `values`, as these easings apply to the transitions *between* the `values`.
     *
     * ```jsx
     * const transition = {
     *   backgroundColor: {
     *     type: 'keyframes',
     *     easings: ['circIn', 'circOut']
     *   }
     * }
     * ```
     *
     * @public
     */
    ease?: Easing | Easing[];
    /**
     * Popmotion's easing prop to define individual easings. `ease` will be mapped to this prop in keyframes animations.
     *
     * @internal
     */
    easings?: Easing | Easing[];
    /**
     * @internal
     */
    elapsed?: number;
    /**
     * The total duration of the animation. Set to `0.3` by default.
     *
     * ```jsx
     * const transition = {
     *   type: "keyframes",
     *   duration: 2
     * }
     *
     * <Frame
     *   animate={{ opacity: 0 }}
     *   transition={transition}
     * />
     * ```
     *
     * @public
     */
    duration?: number;
    /**
     * @public
     */
    repeatDelay?: number;
    /**
     * @internal
     */
    from?: number | string;
    /**
     * @internal
     */
    to?: number | string | ValueTarget;
    /**
     * @internal
     */
    velocity?: number;
    /**
     * @internal
     */
    delay?: number;
}

/**
 * @public
 */
declare type KeyframesTarget = ResolvedKeyframesTarget | [null, ...CustomValueType[]] | CustomValueType[];

declare interface Layout {
    measured: Box;
    actual: Box;
}

declare type LayoutAnimationCompleteListener = () => void;

declare type LayoutAnimationStartListener = () => void;

declare type LayoutEvents = "willUpdate" | "didUpdate" | "beforeMeasure" | "measure" | "projectionUpdate" | "animationStart" | "animationComplete";

declare interface LayoutGroupContextProps {
    id?: string;
    group?: NodeGroup;
    forceRender?: VoidFunction;
}

declare interface LayoutLifecycles {
    onBeforeLayoutMeasure?(box: Box): void;
    onLayoutMeasure?(box: Box, prevBox: Box): void;
    /**
     * @internal
     */
    onLayoutAnimationStart?(): void;
    /**
     * @internal
     */
    onLayoutAnimationComplete?(): void;
}

declare type LayoutMeasureListener = (layout: Box, prevLayout?: Box) => void;

/**
 * @public
 */
declare interface LayoutProps {
    /**
     * If `true`, this component will automatically animate to its new position when
     * its layout changes.
     *
     * ```jsx
     * <motion.div layout />
     * ```
     *
     * This will perform a layout animation using performant transforms. Part of this technique
     * involved animating an element's scale. This can introduce visual distortions on children,
     * `boxShadow` and `borderRadius`.
     *
     * To correct distortion on immediate children, add `layout` to those too.
     *
     * `boxShadow` and `borderRadius` will automatically be corrected if they are already being
     * animated on this component. Otherwise, set them directly via the `initial` prop.
     *
     * If `layout` is set to `"position"`, the size of the component will change instantly and
     * only its position will animate. If `layout` is set to `"size"`, the position of the
     * component will change instantly but its size will animate.
     *
     * If `layout` is set to `"size"`, the position of the component will change instantly and
     * only its size will animate.
     *
     * @public
     */
    layout?: boolean | "position" | "size";
    /**
     * Enable shared layout transitions between different components with the same `layoutId`.
     *
     * When a component with a layoutId is removed from the React tree, and then
     * added elsewhere, it will visually animate from the previous component's bounding box
     * and its latest animated values.
     *
     * ```jsx
     *   {items.map(item => (
     *      <motion.li layout>
     *         {item.name}
     *         {item.isSelected && <motion.div layoutId="underline" />}
     *      </motion.li>
     *   ))}
     * ```
     *
     * If the previous component remains in the tree it will crossfade with the new component.
     *
     * @public
     */
    layoutId?: string;
    /**
     * A callback that will fire when a layout animation on this component starts.
     *
     * @public
     */
    onLayoutAnimationStart?(): void;
    /**
     * A callback that will fire when a layout animation on this component completes.
     *
     * @public
     */
    onLayoutAnimationComplete?(): void;
    /**
     * @public
     */
    layoutDependency?: any;
    /**
     * Wether a projection node should measure its scroll when it or its descendants update their layout.
     *
     * @public
     */
    layoutScroll?: boolean;
}

declare type LayoutUpdateListener = (layout: Axis, prevLayout: Axis) => void;

declare interface LifecycleManager {
    onLayoutMeasure: (callback: LayoutMeasureListener) => () => void;
    notifyLayoutMeasure: LayoutMeasureListener;
    onBeforeLayoutMeasure: (callback: BeforeLayoutMeasureListener) => () => void;
    notifyBeforeLayoutMeasure: BeforeLayoutMeasureListener;
    onLayoutUpdate: (callback: LayoutUpdateListener) => () => void;
    notifyLayoutUpdate: LayoutUpdateListener;
    onUpdate: (callback: UpdateListener) => () => void;
    notifyUpdate: UpdateListener;
    onAnimationStart: (callback: AnimationStartListener) => () => void;
    notifyAnimationStart: AnimationStartListener;
    onAnimationComplete: (callback: AnimationCompleteListener) => () => void;
    notifyAnimationComplete: AnimationCompleteListener;
    onLayoutAnimationStart: (callback: LayoutAnimationStartListener) => () => void;
    notifyLayoutAnimationStart: LayoutAnimationStartListener;
    onLayoutAnimationComplete: (callback: LayoutAnimationCompleteListener) => () => void;
    notifyLayoutAnimationComplete: LayoutAnimationCompleteListener;
    onSetAxisTarget: (callback: SetAxisTargetListener) => () => void;
    notifySetAxisTarget: SetAxisTargetListener;
    onRender: (callback: RenderListener) => () => void;
    notifyRender: RenderListener;
    onUnmount: (callback: () => void) => () => void;
    notifyUnmount: () => void;
    clearAllListeners: () => void;
    updatePropListeners: (props: MotionProps) => void;
}

/**
 * @public
 */
declare type MakeCustomValueType<T> = {
    [K in keyof T]: T[K] | CustomValueType;
};

/**
 * @public
 */
declare type MakeKeyframes<T> = {
    [K in keyof T]: T[K] | T[K][] | [null, ...T[K][]];
};

declare type MakeMotion<T> = MakeCustomValueType<{
    [K in keyof T]: T[K] | MotionValue<number> | MotionValue<string> | MotionValue<any>;
}>;

export declare function makeVisualState(
props: MotionProps,
context: MotionContextProps,
presenceContext: PresenceContextProps | null): VisualState<any, any>

declare interface MeasureContextProps {
    layoutGroup?: LayoutGroupContextProps
    switchLayoutGroup?: SwitchLayoutGroupContext
    isPresent: boolean
    safeToRemove?: VoidFunction | null
}

export declare const MeasureLayoutWithContext: {
    componentDidMount(props: FeatureProps & MeasureContextProps): void;
    getSnapshotBeforeUpdate(props: FeatureProps & MeasureContextProps, prevProps: FeatureProps & MeasureContextProps);
    componentDidUpdate(props: FeatureProps & MeasureContextProps);
    componentWillUnmount(props: FeatureProps & MeasureContextProps);
};

/**
 * @public
 */
declare interface MotionAdvancedProps {
    /**
     * Custom data to use to resolve dynamic variants differently for each animating component.
     *
     * ```jsx
     * const variants = {
     *   visible: (custom) => ({
     *     opacity: 1,
     *     transition: { delay: custom * 0.2 }
     *   })
     * }
     *
     * <motion.div custom={0} animate="visible" variants={variants} />
     * <motion.div custom={1} animate="visible" variants={variants} />
     * <motion.div custom={2} animate="visible" variants={variants} />
     * ```
     *
     * @public
     */
    custom?: any;
    /**
     * @public
     * Set to `false` to prevent inheriting variant changes from its parent.
     */
    inherit?: boolean;
}

/**
 * @public
 */
declare interface MotionConfigContext {
    /**
     * @internal
     */
    transformPagePoint: TransformPoint;
    /**
     * Determines whether this is a static context ie the Framer canvas. If so,
     * it'll disable all dynamic functionality.
     *
     * @internal
     */
    isStatic: boolean;
    /**
     * Defines a new default transition for the entire tree.
     *
     * @public
     */
    transition?: Transition;
    /**
     * If true, will respect the device prefersReducedMotion setting by switching
     * transform animations off.
     *
     * @public
     */
    reducedMotion?: "always" | "never" | "user";
}

/**
 * @public
 */
declare const MotionConfigContext: Context<MotionConfigContext>;

export declare interface MotionContextProps {
    visualElement?: VisualElement;
    initial?: false | string | string[];
    animate?: string | string[];
}

declare type MotionCSS = MakeMotion<Omit_2<CSSProperties, "rotate" | "scale" | "perspective">>;

/**
 * Props for `motion` components.
 *
 * @public
 */
export declare interface MotionProps extends AnimationProps, VisualElementLifecycles, PanHandlers, TapHandlers, HoverHandlers, FocusHandlers, ViewportProps, DraggableProps, LayoutProps, MotionAdvancedProps {
    /**
     * Properties, variant label or array of variant labels to start in.
     *
     * Set to `false` to initialise with the values in `animate` (disabling the mount animation)
     *
     * ```jsx
     * // As values
     * <motion.div initial={{ opacity: 1 }} />
     *
     * // As variant
     * <motion.div initial="visible" variants={variants} />
     *
     * // Multiple variants
     * <motion.div initial={["visible", "active"]} variants={variants} />
     *
     * // As false (disable mount animation)
     * <motion.div initial={false} animate={{ opacity: 0 }} />
     * ```
     */
    initial?: boolean | Target | VariantLabels;
    /**
     *
     * The React DOM `style` prop, enhanced with support for `MotionValue`s and separate `transform` values.
     *
     * ```jsx
     * export const MyComponent = () => {
     *   const x = useMotionValue(0)
     *
     *   return <motion.div style={{ x, opacity: 1, scale: 0.5 }} />
     * }
     * ```
     */
    style?: MotionStyle;
    /**
     * By default, Framer Motion generates a `transform` property with a sensible transform order. `transformTemplate`
     * can be used to create a different order, or to append/preprend the automatically generated `transform` property.
     *
     * ```jsx
     * <motion.div
     *   style={{ x: 0, rotate: 180 }}
     *   transformTemplate={
     *     ({ x, rotate }) => `rotate(${rotate}deg) translateX(${x}px)`
     *   }
     * />
     * ```
     *
     * @param transform - The latest animated transform props.
     * @param generatedTransform - The transform string as automatically generated by Framer Motion
     *
     * @public
     */
    transformTemplate?(transform: TransformProperties, generatedTransform: string): string;
    /**
     * This allows values to be transformed before being animated or set as styles.
     *
     * For instance, this allows custom values in Framer Library like `size` to be converted into `width` and `height`.
     * It also allows us a chance to take a value like `Color` and convert it to an animatable color string.
     *
     * A few structural typing changes need making before this can be a public property:
     * - Allow `Target` values to be appended by user-defined types (delete `CustomStyles` - does `size` throw a type error?)
     * - Extract `CustomValueType` as a separate user-defined type (delete `CustomValueType` and animate a `Color` - does this throw a type error?).
     *
     * @param values -
     *
     * @internal
     */
    transformValues?<V extends ResolvedValues>(values: V): V;
}

/**
 * @public
 */
declare type MotionStyle = MotionCSS & MotionTransform & MakeMotion<SVGPathProperties> & MakeCustomValueType<CustomStyles>;

/**
 * @public
 */
declare type MotionTransform = MakeMotion<TransformProperties>;

/**
 * `MotionValue` is used to track the state and velocity of motion values.
 *
 * @public
 */
export declare class MotionValue<V = any> {
    /**
     * The current state of the `MotionValue`.
     *
     * @internal
     */
    private current;
    /**
     * The previous state of the `MotionValue`.
     *
     * @internal
     */
    private prev;
    /**
     * Duration, in milliseconds, since last updating frame.
     *
     * @internal
     */
    private timeDelta;
    /**
     * Timestamp of the last time this `MotionValue` was updated.
     *
     * @internal
     */
    private lastUpdated;
    /**
     * Functions to notify when the `MotionValue` updates.
     *
     * @internal
     */
    private updateSubscribers;
    /**
     * Functions to notify when the velocity updates.
     *
     * @internal
     */
    velocityUpdateSubscribers: SubscriptionManager<Subscriber<number>>;
    /**
     * Functions to notify when the `MotionValue` updates and `render` is set to `true`.
     *
     * @internal
     */
    private renderSubscribers;
    /**
     * Add a passive effect to this `MotionValue`.
     *
     * A passive effect intercepts calls to `set`. For instance, `useSpring` adds
     * a passive effect that attaches a `spring` to the latest
     * set value. Hypothetically there could be a `useSmooth` that attaches an input smoothing effect.
     *
     * @internal
     */
    private passiveEffect?;
    /**
     * A reference to the currently-controlling Popmotion animation
     *
     * @internal
     */
    private stopAnimation?;
    /**
     * Tracks whether this value can output a velocity. Currently this is only true
     * if the value is numerical, but we might be able to widen the scope here and support
     * other value types.
     *
     * @internal
     */
    private canTrackVelocity;
    /**
     * @param init - The initiating value
     * @param config - Optional configuration options
     *
     * -  `transformer`: A function to transform incoming values with.
     *
     * @internal
     */
    constructor(init: V);
    /**
     * Adds a function that will be notified when the `MotionValue` is updated.
     *
     * It returns a function that, when called, will cancel the subscription.
     *
     * When calling `onChange` inside a React component, it should be wrapped with the
     * `useEffect` hook. As it returns an unsubscribe function, this should be returned
     * from the `useEffect` function to ensure you don't add duplicate subscribers..
     *
     * ```jsx
     * export const MyComponent = () => {
     *   const x = useMotionValue(0)
     *   const y = useMotionValue(0)
     *   const opacity = useMotionValue(1)
     *
     *   useEffect(() => {
     *     function updateOpacity() {
     *       const maxXY = Math.max(x.get(), y.get())
     *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
     *       opacity.set(newOpacity)
     *     }
     *
     *     const unsubscribeX = x.onChange(updateOpacity)
     *     const unsubscribeY = y.onChange(updateOpacity)
     *
     *     return () => {
     *       unsubscribeX()
     *       unsubscribeY()
     *     }
     *   }, [])
     *
     *   return <motion.div style={{ x }} />
     * }
     * ```
     *
     * @internalremarks
     *
     * We could look into a `useOnChange` hook if the above lifecycle management proves confusing.
     *
     * ```jsx
     * useOnChange(x, () => {})
     * ```
     *
     * @param subscriber - A function that receives the latest value.
     * @returns A function that, when called, will cancel this subscription.
     *
     * @public
     */
    onChange(subscription: Subscriber<V>): () => void;
    clearListeners(): void;
    /**
     * Adds a function that will be notified when the `MotionValue` requests a render.
     *
     * @param subscriber - A function that's provided the latest value.
     * @returns A function that, when called, will cancel this subscription.
     *
     * @internal
     */
    onRenderRequest(subscription: Subscriber<V>): () => void;
    /**
     * Attaches a passive effect to the `MotionValue`.
     *
     * @internal
     */
    attach(passiveEffect: PassiveEffect<V>): void;
    /**
     * Sets the state of the `MotionValue`.
     *
     * @remarks
     *
     * ```jsx
     * const x = useMotionValue(0)
     * x.set(10)
     * ```
     *
     * @param latest - Latest value to set.
     * @param render - Whether to notify render subscribers. Defaults to `true`
     *
     * @public
     */
    set(v: V, render?: boolean): void;
    updateAndNotify: (v: V, render?: boolean) => void;
    /**
     * Returns the latest state of `MotionValue`
     *
     * @returns - The latest state of `MotionValue`
     *
     * @public
     */
    get(): V;
    /**
     * @public
     */
    getPrevious(): V;
    /**
     * Returns the latest velocity of `MotionValue`
     *
     * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
     *
     * @public
     */
    getVelocity(): number;
    /**
     * Schedule a velocity check for the next frame.
     *
     * This is an instanced and bound function to prevent generating a new
     * function once per frame.
     *
     * @internal
     */
    private scheduleVelocityCheck;
    /**
     * Updates `prev` with `current` if the value hasn't been updated this frame.
     * This ensures velocity calculations return `0`.
     *
     * This is an instanced and bound function to prevent generating a new
     * function once per frame.
     *
     * @internal
     */
    private velocityCheck;
    hasAnimated: boolean;
    /**
     * Registers a new animation to control this `MotionValue`. Only one
     * animation can drive a `MotionValue` at one time.
     *
     * ```jsx
     * value.start()
     * ```
     *
     * @param animation - A function that starts the provided animation
     *
     * @internal
     */
    start(animation: StartAnimation): Promise<void>;
    /**
     * Stop the currently active animation.
     *
     * @public
     */
    stop(): void;
    /**
     * Returns `true` if this value is currently animating.
     *
     * @public
     */
    isAnimating(): boolean;
    private clearAnimation;
    /**
     * Destroy and clean up subscribers to this `MotionValue`.
     *
     * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
     * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
     * created a `MotionValue` via the `motionValue` function.
     *
     * @public
     */
    destroy(): void;
}

export declare function motionValue<T>(init: T): MotionValue<T>;

declare type MultiTransformer<I, O> = (input: I[]) => O;

declare interface NodeGroup {
    add: (node: IProjectionNode) => void;
    remove: (node: IProjectionNode) => void;
    dirty: VoidFunction;
}

declare class NodeStack {
    lead?: IProjectionNode;
    prevLead?: IProjectionNode;
    members: IProjectionNode[];
    add(node: IProjectionNode): void;
    remove(node: IProjectionNode): void;
    relegate(node: IProjectionNode): boolean;
    promote(node: IProjectionNode, preserveFollowOpacity?: boolean): void;
    exitAnimationComplete(): void;
    scheduleRender(): void;
    /**
     * Clear any leads that have been removed this render to prevent them from being
     * used in future animations and to prevent memory leaks
     */
    removeLeadSnapshot(): void;
}

/**
 * @public
 */
declare interface None {
    /**
     * Set `type` to `false` for an instant transition.
     *
     * @public
     */
    type: false;
    /**
     * @internal
     */
    from?: number | string;
    /**
     * @internal
     */
    delay?: number;
    /**
     * @internal
     */
    velocity?: number;
}

declare type Omit_2<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Options for orchestrating the timing of animations.
 *
 * @public
 */
declare interface Orchestration {
    /**
     * Delay the animation by this duration (in seconds). Defaults to `0`.
     *
     * @remarks
     * ```javascript
     * const transition = {
     *   delay: 0.2
     * }
     * ```
     *
     * @public
     */
    delay?: number;
    /**
     * Describes the relationship between the transition and its children. Set
     * to `false` by default.
     *
     * @remarks
     * When using variants, the transition can be scheduled in relation to its
     * children with either `"beforeChildren"` to finish this transition before
     * starting children transitions, `"afterChildren"` to finish children
     * transitions before starting this transition.
     *
     * ```jsx
     * const list = {
     *   hidden: {
     *     opacity: 0,
     *     transition: { when: "afterChildren" }
     *   }
     * }
     *
     * const item = {
     *   hidden: {
     *     opacity: 0,
     *     transition: { duration: 2 }
     *   }
     * }
     *
     * return (
     *   <motion.ul variants={list} animate="hidden">
     *     <motion.li variants={item} />
     *     <motion.li variants={item} />
     *   </motion.ul>
     * )
     * ```
     *
     * @public
     */
    when?: false | "beforeChildren" | "afterChildren" | string;
    /**
     * When using variants, children animations will start after this duration
     * (in seconds). You can add the `transition` property to both the `Frame` and the `variant` directly. Adding it to the `variant` generally offers more flexibility, as it allows you to customize the delay per visual state.
     *
     * ```jsx
     * const container = {
     *   hidden: { opacity: 0 },
     *   show: {
     *     opacity: 1,
     *     transition: {
     *       delayChildren: 0.5
     *     }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 },
     *   show: { opacity: 1 }
     * }
     *
     * return (
     *   <motion.ul
     *     variants={container}
     *     initial="hidden"
     *     animate="show"
     *   >
     *     <motion.li variants={item} />
     *     <motion.li variants={item} />
     *   </motion.ul>
     * )
     * ```
     *
     * @public
     */
    delayChildren?: number;
    /**
     * When using variants, animations of child components can be staggered by this
     * duration (in seconds).
     *
     * For instance, if `staggerChildren` is `0.01`, the first child will be
     * delayed by `0` seconds, the second by `0.01`, the third by `0.02` and so
     * on.
     *
     * The calculated stagger delay will be added to `delayChildren`.
     *
     * ```jsx
     * const container = {
     *   hidden: { opacity: 0 },
     *   show: {
     *     opacity: 1,
     *     transition: {
     *       staggerChildren: 0.5
     *     }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 },
     *   show: { opacity: 1 }
     * }
     *
     * return (
     *   <motion.ol
     *     variants={container}
     *     initial="hidden"
     *     animate="show"
     *   >
     *     <motion.li variants={item} />
     *     <motion.li variants={item} />
     *   </motion.ol>
     * )
     * ```
     *
     * @public
     */
    staggerChildren?: number;
    /**
     * The direction in which to stagger children.
     *
     * A value of `1` staggers from the first to the last while `-1`
     * staggers from the last to the first.
     *
     * ```jsx
     * const container = {
     *   hidden: { opacity: 0 },
     *   show: {
     *     opacity: 1,
     *     transition: {
     *       delayChildren: 0.5,
     *       staggerDirection: -1
     *     }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 },
     *   show: { opacity: 1 }
     * }
     *
     * return (
     *   <motion.ul
     *     variants={container}
     *     initial="hidden"
     *     animate="show"
     *   >
     *     <motion.li variants={item} size={50} />
     *     <motion.li variants={item} size={50} />
     *   </motion.ul>
     * )
     * ```
     *
     * @public
     */
    staggerDirection?: number;
}

/**
 * @public
 */
declare interface PanHandlers {
    /**
     * Callback function that fires when the pan gesture is recognised on this element.
     *
     * **Note:** For pan gestures to work correctly with touch input, the element needs
     * touch scrolling to be disabled on either x/y or both axis with the
     * [touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action) CSS rule.
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - A {@link PanInfo} object containing `x` and `y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPan?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires when the pan gesture begins on this element.
     *
     * ```jsx
     * function onPanStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPanStart={onPanStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - A {@link PanInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPanStart?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires when we begin detecting a pan gesture. This
     * is analogous to `onMouseStart` or `onTouchStart`.
     *
     * ```jsx
     * function onPanSessionStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPanSessionStart={onPanSessionStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link EventInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     */
    onPanSessionStart?(event: MouseEvent | TouchEvent | PointerEvent, info: EventInfo): void;
    /**
     * Callback function that fires when the pan gesture ends on this element.
     *
     * ```jsx
     * function onPanEnd(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPanEnd={onPanEnd} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - A {@link PanInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPanEnd?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
}

/**
 * Passed in to pan event handlers like `onPan` the `PanInfo` object contains
 * information about the current state of the tap gesture such as its
 * `point`, `delta`, `offset` and `velocity`.
 *
 * ```jsx
 * <motion.div onPan={(event, info) => {
 *   console.log(info.point.x, info.point.y)
 * }} />
 * ```
 *
 * @public
 */
declare interface PanInfo {
    /**
     * Contains `x` and `y` values for the current pan position relative
     * to the device or page.
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    point: Point;
    /**
     * Contains `x` and `y` values for the distance moved since
     * the last event.
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.delta.x, info.delta.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    delta: Point;
    /**
     * Contains `x` and `y` values for the distance moved from
     * the first pan event.
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.offset.x, info.offset.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    offset: Point;
    /**
     * Contains `x` and `y` values for the current velocity of the pointer, in px/ms.
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.velocity.x, info.velocity.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    velocity: Point;
}

/**
 * @public
 */
declare type PassiveEffect<T> = (v: T, safeSetter: (v: T) => void) => void;

/**
 * @public
 */
declare type PermissiveTransitionDefinition = {
    [key: string]: any;
};

export declare interface Point {
    x: number;
    y: number;
}

/**
 * @public
 */
declare interface PresenceContextProps {
    id: number;
    isPresent: boolean;
    register: (id: number) => () => void;
    onExitComplete?: (id: number) => void;
    initial?: false | VariantLabels;
    custom?: any;
}

declare interface ProjectionNodeOptions {
    animate?: boolean;
    layoutScroll?: boolean;
    alwaysMeasureLayout?: boolean;
    scheduleRender?: VoidFunction;
    onExitComplete?: VoidFunction;
    animationType?: "size" | "position" | "both";
    layoutId?: string;
    layout?: boolean | string;
    visualElement?: VisualElement;
    crossfade?: boolean;
    transition?: Transition;
    initialPromotionConfig?: InitialPromotionConfig;
}

declare type RenderListener = () => void;

declare interface Repeat {
    /**
     * The number of times to repeat the transition. Set to `Infinity` for perpetual repeating.
     *
     * Without setting `repeatType`, this will loop the animation.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ repeat: Infinity, duration: 2 }}
     * />
     * ```
     *
     * @public
     */
    repeat?: number;
    /**
     * How to repeat the animation. This can be either:
     *
     * "loop": Repeats the animation from the start
     *
     * "reverse": Alternates between forward and backwards playback
     *
     * "mirror": Switches `from` and `to` alternately
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{
     *     repeat: 1,
     *     repeatType: "reverse",
     *     duration: 2
     *   }}
     * />
     * ```
     *
     * @public
     */
    repeatType?: "loop" | "reverse" | "mirror";
    /**
     * When repeating an animation, `repeatDelay` will set the
     * duration of the time to wait, in seconds, between each repetition.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ repeat: Infinity, repeatDelay: 1 }}
     * />
     * ```
     *
     * @public
     */
    repeatDelay?: number;
}

/**
 * @public
 */
declare type ResolvedKeyframesTarget = [null, ...number[]] | number[] | [null, ...string[]] | string[];

/**
 * @public
 */
declare type ResolvedSingleTarget = string | number;

/**
 * A generic set of string/number values
 */
declare interface ResolvedValues {
    [key: string]: string | number;
}

/**
 * @public
 */
declare type ResolvedValueTarget = ResolvedSingleTarget | ResolvedKeyframesTarget;

declare type SetAxisTargetListener = () => void;

/**
 * @public
 */
declare type SingleTarget = ResolvedSingleTarget | CustomValueType;

declare type SingleTransformer<I, O> = (input: I) => O;

declare interface Snapshot {
    measured: Box;
    layout: Box;
    latestValues: ResolvedValues;
    isShared?: boolean;
}

/**
 * An animation that simulates spring physics for realistic motion.
 * This is the default animation for physical values like `x`, `y`, `scale` and `rotate`.
 *
 * @public
 */
declare interface Spring extends Repeat {
    /**
     * Set `type` to `"spring"` to animate using spring physics for natural
     * movement. Type is set to `"spring"` by default.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring' }}
     * />
     * ```
     *
     * @public
     */
    type: "spring";
    /**
     * Stiffness of the spring. Higher values will create more sudden movement.
     * Set to `100` by default.
     *
     * ```jsx
     * <motion.section
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', stiffness: 50 }}
     * />
     * ```
     *
     * @public
     */
    stiffness?: number;
    /**
     * Strength of opposing force. If set to 0, spring will oscillate
     * indefinitely. Set to `10` by default.
     *
     * ```jsx
     * <motion.a
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', damping: 300 }}
     * />
     * ```
     *
     * @public
     */
    damping?: number;
    /**
     * Mass of the moving object. Higher values will result in more lethargic
     * movement. Set to `1` by default.
     *
     * ```jsx
     * <motion.feTurbulence
     *   animate={{ baseFrequency: 0.5 } as any}
     *   transition={{ type: "spring", mass: 0.5 }}
     * />
     * ```
     *
     * @public
     */
    mass?: number;
    /**
     * The duration of the animation, defined in seconds. Spring animations can be a maximum of 10 seconds.
     *
     * If `bounce` is set, this defaults to `0.8`.
     *
     * Note: `duration` and `bounce` will be overridden if `stiffness`, `damping` or `mass` are set.
     *
     * ```jsx
     * <motion.div
     *   animate={{ x: 100 }}
     *   transition={{ type: "spring", duration: 0.8 }}
     * />
     * ```
     *
     * @public
     */
    duration?: number;
    /**
     * `bounce` determines the "bounciness" of a spring animation.
     *
     * `0` is no bounce, and `1` is extremely bouncy.
     *
     * If `duration` is set, this defaults to `0.25`.
     *
     * Note: `bounce` and `duration` will be overridden if `stiffness`, `damping` or `mass` are set.
     *
     * ```jsx
     * <motion.div
     *   animate={{ x: 100 }}
     *   transition={{ type: "spring", bounce: 0.25 }}
     * />
     * ```
     *
     * @public
     */
    bounce?: number;
    /**
     * End animation if absolute speed (in units per second) drops below this
     * value and delta is smaller than `restDelta`. Set to `0.01` by default.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', restSpeed: 0.5 }}
     * />
     * ```
     *
     * @public
     */
    restSpeed?: number;
    /**
     * End animation if distance is below this value and speed is below
     * `restSpeed`. When animation ends, spring gets ???snapped??? to. Set to
     * `0.01` by default.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', restDelta: 0.5 }}
     * />
     * ```
     *
     * @public
     */
    restDelta?: number;
    /**
     * The value to animate from.
     * By default, this is the initial state of the animating value.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', from: 90 }}
     * />
     * ```
     *
     * @public
     */
    from?: number | string;
    /**
     * @internal
     */
    to?: number | string | ValueTarget;
    /**
     * The initial velocity of the spring. By default this is the current velocity of the component.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', velocity: 2 }}
     * />
     * ```
     *
     * @public
     */
    velocity?: number;
    /**
     * @internal
     */
    delay?: number;
}

declare type StartAnimation = (complete: () => void) => () => void;

/**
 * Start animation on a MotionValue. This function is an interface between
 * Framer Motion and Popmotion
 *
 * @internal
 */
declare function startAnimation(key: string, value: MotionValue, target: ResolvedValueTarget, transition?: Transition): Promise<void>;

/**
 * @public
 */
declare type Subscriber<T> = (v: T) => void;

declare class SubscriptionManager<Handler extends GenericHandler> {
    private subscriptions;
    add(handler: Handler): () => void;
    notify(a?: Parameters<Handler>[0], b?: Parameters<Handler>[1], c?: Parameters<Handler>[2]): void;
    getSize(): number;
    clear(): void;
}

/**
 * @public
 */
declare interface SVGPathProperties {
    pathLength?: number;
    pathOffset?: number;
    pathSpacing?: number;
}

export declare const svgVisualElement: ({ parent, props, presenceId, blockInitialAnimation, visualState, shouldReduceMotion, }: VisualElementOptions<SVGElement, any>, options?: DOMVisualElementOptions) => VisualElement<SVGElement, any>;

declare interface SwitchLayoutGroup {
    register?: (member: IProjectionNode) => void;
    deregister?: (member: IProjectionNode) => void;
}

declare type SwitchLayoutGroupContext = SwitchLayoutGroup & InitialPromotionConfig;

/**
 * @internal
 */
declare const SwitchLayoutGroupContext: Context<SwitchLayoutGroupContext>;

/**
 * @public
 */
declare interface TapHandlers {
    /**
     * Callback when the tap gesture successfully ends on this element.
     *
     * ```jsx
     * function onTap(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTap={onTap} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTap?(event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo): void;
    /**
     * Callback when the tap gesture starts on this element.
     *
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTapStart={onTapStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTapStart?(event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo): void;
    /**
     * Callback when the tap gesture ends outside this element.
     *
     * ```jsx
     * function onTapCancel(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTapCancel={onTapCancel} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTapCancel?(event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo): void;
    /**
     * Properties or variant label to animate to while the component is pressed.
     *
     * ```jsx
     * <motion.div whileTap={{ scale: 0.8 }} />
     * ```
     */
    whileTap?: VariantLabels | TargetAndTransition;
}

/**
 * Passed in to tap event handlers like `onTap` the `TapInfo` object contains
 * information about the tap gesture such as it???s location.
 *
 * ```jsx
 * function onTap(event, info) {
 *   console.log(info.point.x, info.point.y)
 * }
 *
 * <motion.div onTap={onTap} />
 * ```
 *
 * @public
 */
declare interface TapInfo {
    /**
     * Contains `x` and `y` values for the tap gesture relative to the
     * device or page.
     *
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTapStart={onTapStart} />
     * ```
     *
     * @public
     */
    point: Point;
}

/**
 * @public
 */
declare type Target = MakeCustomValueType<TargetProperties>;

/**
 * An object that specifies values to animate to. Each value may be set either as
 * a single value, or an array of values.
 *
 * It may also option contain these properties:
 *
 * - `transition`: Specifies transitions for all or individual values.
 * - `transitionEnd`: Specifies values to set when the animation finishes.
 *
 * ```jsx
 * const target = {
 *   x: "0%",
 *   opacity: 0,
 *   transition: { duration: 1 },
 *   transitionEnd: { display: "none" }
 * }
 * ```
 *
 * @public
 */
declare type TargetAndTransition = TargetWithKeyframes & {
    transition?: Transition;
    transitionEnd?: Target;
};

declare type TargetProperties = CSSPropertiesWithoutTransitionOrSingleTransforms & SVGAttributes<SVGElement> & TransformProperties & CustomStyles & SVGPathProperties;

declare type TargetResolver = (custom: any, current: Target, velocity: Target) => TargetAndTransition | string;

/**
 * @public
 */
declare type TargetWithKeyframes = MakeKeyframes<Target>;

/**
 * @public
 */
declare interface TransformOptions<T> {
    /**
     * Clamp values to within the given range. Defaults to `true`
     *
     * @public
     */
    clamp?: boolean;
    /**
     * Easing functions to use on the interpolations between each value in the input and output ranges.
     *
     * If provided as an array, the array must be one item shorter than the input and output ranges, as the easings apply to the transition **between** each.
     *
     * @public
     */
    ease?: Easing_2 | Easing_2[];
    /**
     * @internal
     */
    mixer?: (from: T, to: T) => (v: number) => any;
}

export declare type TransformPoint = (point: Point) => Point;

declare interface TransformProperties {
    x?: string | number;
    y?: string | number;
    z?: string | number;
    translateX?: string | number;
    translateY?: string | number;
    translateZ?: string | number;
    rotate?: string | number;
    rotateX?: string | number;
    rotateY?: string | number;
    rotateZ?: string | number;
    scale?: string | number;
    scaleX?: string | number;
    scaleY?: string | number;
    scaleZ?: string | number;
    skew?: string | number;
    skewX?: string | number;
    skewY?: string | number;
    originX?: string | number;
    originY?: string | number;
    originZ?: string | number;
    perspective?: string | number;
    transformPerspective?: string | number;
}

/**
 * Transition props
 *
 * @public
 */
declare type Transition = (Orchestration & Repeat & TransitionDefinition) | (Orchestration & Repeat & TransitionMap);

/**
 * @public
 */
declare type TransitionDefinition = Tween | Spring | Keyframes | Inertia | Just | None | PermissiveTransitionDefinition;

declare type TransitionMap = Orchestration & {
    [key: string]: TransitionDefinition;
};

/**
 * An animation that animates between two or more values over a specific duration of time.
 * This is the default animation for non-physical values like `color` and `opacity`.
 *
 * @public
 */
declare interface Tween extends Repeat {
    /**
     * Set `type` to `"tween"` to use a duration-based tween animation.
     * If any non-orchestration `transition` values are set without a `type` property,
     * this is used as the default animation.
     *
     * ```jsx
     * <motion.path
     *   animate={{ pathLength: 1 }}
     *   transition={{ duration: 2, type: "tween" }}
     * />
     * ```
     *
     * @public
     */
    type?: "tween";
    /**
     * The duration of the tween animation. Set to `0.3` by default, 0r `0.8` if animating a series of keyframes.
     *
     * ```jsx
     * const variants = {
     *   visible: {
     *     opacity: 1,
     *     transition: { duration: 2 }
     *   }
     * }
     * ```
     *
     * @public
     */
    duration?: number;
    /**
     * The easing function to use. Set as one of the below.
     *
     * - The name of an existing easing function.
     *
     * - An array of four numbers to define a cubic bezier curve.
     *
     * - An easing function, that accepts and returns a value `0-1`.
     *
     * If the animating value is set as an array of multiple values for a keyframes
     * animation, `ease` can be set as an array of easing functions to set different easings between
     * each of those values.
     *
     *
     * ```jsx
     * <motion.div
     *   animate={{ opacity: 0 }}
     *   transition={{ ease: [0.17, 0.67, 0.83, 0.67] }}
     * />
     * ```
     *
     * @public
     */
    ease?: Easing | Easing[];
    /**
     * The duration of time already elapsed in the animation. Set to `0` by
     * default.
     *
     * @internal
     */
    elapsed?: number;
    /**
     * When animating keyframes, `times` can be used to determine where in the animation each keyframe is reached.
     * Each value in `times` is a value between `0` and `1`, representing `duration`.
     *
     * There must be the same number of `times` as there are keyframes.
     * Defaults to an array of evenly-spread durations.
     *
     * ```jsx
     * <motion.div
     *   animate={{ scale: [0, 1, 0.5, 1] }}
     *   transition={{ times: [0, 0.1, 0.9, 1] }}
     * />
     * ```
     *
     * @public
     */
    times?: number[];
    /**
     * When animating keyframes, `easings` can be used to define easing functions between each keyframe. This array should be one item fewer than the number of keyframes, as these easings apply to the transitions between the keyframes.
     *
     * ```jsx
     * <motion.div
     *   animate={{ backgroundColor: ["#0f0", "#00f", "#f00"] }}
     *   transition={{ easings: ["easeIn", "easeOut"] }}
     * />
     * ```
     *
     * @public
     */
    easings?: Easing[];
    /**
     * The value to animate from.
     * By default, this is the current state of the animating value.
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ from: 90, duration: 2 }}
     * />
     * ```
     *
     * @public
     */
    from?: number | string;
    /**
     * @internal
     */
    to?: number | string | ValueTarget;
    /**
     * @internal
     */
    velocity?: number;
    /**
     * @internal
     */
    delay?: number;
}

declare type UpdateListener = (latest: ResolvedValues) => void;

export declare function useFocusGesture(props: FeatureProps): () => void;

export declare function useHoverGesture(props: FeatureProps): () => void;

export declare function usePanGesture(props: FeatureProps, { transformPagePoint }: MotionConfigContext): () => void;

export declare function useProjection(
projectionId: number | undefined,
    { layoutId, layout, drag, dragConstraints, layoutScroll }: MotionProps,
initialPromotionConfig: SwitchLayoutGroupContext,
visualElement?: VisualElement,
ProjectionNodeConstructor?: any
): void

export declare function useTapGesture(props: FeatureProps): () => void;

/**
 * Create a `MotionValue` that transforms the output of another `MotionValue` by mapping it from one range of values into another.
 *
 * @remarks
 *
 * Given an input range of `[-200, -100, 100, 200]` and an output range of
 * `[0, 1, 1, 0]`, the returned `MotionValue` will:
 *
 * - When provided a value between `-200` and `-100`, will return a value between `0` and  `1`.
 * - When provided a value between `-100` and `100`, will return `1`.
 * - When provided a value between `100` and `200`, will return a value between `1` and  `0`
 *
 *
 * The input range must be a linear series of numbers. The output range
 * can be any value type supported by Framer Motion: numbers, colors, shadows, etc.
 *
 * Every value in the output range must be of the same type and in the same format.
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const x = useMotionValue(0)
 *   const xRange = [-200, -100, 100, 200]
 *   const opacityRange = [0, 1, 1, 0]
 *   const opacity = useTransform(x, xRange, opacityRange)
 *
 *   return (
 *     <motion.div
 *       animate={{ x: 200 }}
 *       style={{ opacity, x }}
 *     />
 *   )
 * }
 * ```
 *
 * @param inputValue - `MotionValue`
 * @param inputRange - A linear series of numbers (either all increasing or decreasing)
 * @param outputRange - A series of numbers, colors or strings. Must be the same length as `inputRange`.
 * @param options -
 *
 *  - clamp: boolean. Clamp values to within the given range. Defaults to `true`
 *  - ease: EasingFunction[]. Easing functions to use on the interpolations between each value in the input and output ranges. If provided as an array, the array must be one item shorter than the input and output ranges, as the easings apply to the transition between each.
 *
 * @returns `MotionValue`
 *
 * @public
 */
export declare function useTransform<I, O>(value: MotionValue<number>, inputRange: InputRange, outputRange: O[], options?: TransformOptions<O>): MotionValue<O>;

/**
 * Create a `MotionValue` that transforms the output of another `MotionValue` through a function.
 * In this example, `y` will always be double `x`.
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const x = useMotionValue(10)
 *   const y = useTransform(x, value => value * 2)
 *
 *   return <motion.div style={{ x, y }} />
 * }
 * ```
 *
 * @param input - A `MotionValue` that will pass its latest value through `transform` to update the returned `MotionValue`.
 * @param transform - A function that accepts the latest value from `input` and returns a new value.
 * @returns `MotionValue`
 *
 * @public
 */
export declare function useTransform<I, O>(input: MotionValue<I>, transformer: SingleTransformer<I, O>): MotionValue<O>;

/**
 * Pass an array of `MotionValue`s and a function to combine them. In this example, `z` will be the `x` multiplied by `y`.
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const x = useMotionValue(0)
 *   const y = useMotionValue(0)
 *   const z = useTransform([x, y], [latestX, latestY] => latestX * latestY)
 *
 *   return <motion.div style={{ x, y, z }} />
 * }
 * ```
 *
 * @param input - An array of `MotionValue`s that will pass their latest values through `transform` to update the returned `MotionValue`.
 * @param transform - A function that accepts the latest values from `input` and returns a new value.
 * @returns `MotionValue`
 *
 * @public
 */
export declare function useTransform<I, O>(input: MotionValue<string>[] | MotionValue<number>[] | MotionValue<string | number>[], transformer: MultiTransformer<I, O>): MotionValue<O>;

export declare function useViewport(props: FeatureProps): () => void;

/**
 * @public
 */
declare type ValueTarget = SingleTarget | KeyframesTarget;

/**
 * @public
 */
declare type Variant = TargetAndTransition | TargetResolver;

/**
 * Either a string, or array of strings, that reference variants defined via the `variants` prop.
 * @public
 */
declare type VariantLabels = string | string[];

/**
 * @public
 */
declare type Variants = {
    [key: string]: Variant;
};

declare type ViewportEventHandler = (entry: IntersectionObserverEntry | null) => void;

declare interface ViewportOptions {
    root?: RefObject<Element>;
    once?: boolean;
    margin?: string;
    amount?: "some" | "all" | number;
    fallback?: boolean;
}

declare interface ViewportProps {
    whileInView?: VariantLabels | TargetAndTransition;
    onViewportEnter?: ViewportEventHandler;
    onViewportLeave?: ViewportEventHandler;
    viewport?: ViewportOptions;
}

declare interface VisualElement<Instance = any, RenderState = any> extends LifecycleManager {
    treeType: string;
    depth: number;
    parent?: VisualElement;
    children: Set<VisualElement>;
    variantChildren?: Set<VisualElement>;
    current: Instance | null;
    manuallyAnimateOnMount: boolean;
    blockInitialAnimation?: boolean;
    presenceId: number | undefined;
    isMounted(): boolean;
    mount(instance: Instance): void;
    unmount(): void;
    isStatic?: boolean;
    getInstance(): Instance | null;
    sortNodePosition(element: VisualElement): number;
    measureViewportBox(withTransform?: boolean): Box;
    addVariantChild(child: VisualElement): undefined | (() => void);
    getClosestVariantNode(): VisualElement | undefined;
    shouldReduceMotion?: boolean | null;
    animateMotionValue?: typeof startAnimation;
    projection?: IProjectionNode;
    /**
     * Visibility
     */
    isVisible?: boolean;
    setVisibility(visibility: boolean): void;
    hasValue(key: string): boolean;
    addValue(key: string, value: MotionValue<any>): void;
    removeValue(key: string): void;
    getValue(key: string): undefined | MotionValue;
    getValue(key: string, defaultValue: string | number): MotionValue;
    getValue(key: string, defaultValue?: string | number): undefined | MotionValue;
    forEachValue(callback: (value: MotionValue, key: string) => void): void;
    readValue(key: string): string | number | undefined | null;
    setBaseTarget(key: string, value: string | number | null): void;
    getBaseTarget(key: string): number | string | undefined | null;
    getStaticValue(key: string): number | string | undefined;
    setStaticValue(key: string, value: number | string): void;
    getLatestValues(): ResolvedValues;
    scheduleRender(): void;
    makeTargetAnimatable(target: TargetAndTransition, isLive?: boolean): TargetAndTransition;
    setProps(props: MotionProps): void;
    getProps(): MotionProps;
    getVariant(name: string): Variant | undefined;
    getDefaultTransition(): Transition | undefined;
    getVariantContext(startAtParent?: boolean): undefined | {
        initial?: string | string[];
        animate?: string | string[];
        exit?: string | string[];
        whileHover?: string | string[];
        whileDrag?: string | string[];
        whileFocus?: string | string[];
        whileTap?: string | string[];
    };
    getTransformPagePoint: () => TransformPoint | undefined;
    build(): RenderState;
    syncRender(): void;
    isPresenceRoot?: boolean;
    isPresent?: boolean;
    prevDragCursor?: Point;
    getLayoutId(): string | undefined;
    animationState?: AnimationState;
}

/**
 *
 */
export declare class VisualElementDragControls {
    private visualElement;
    private panSession?;
    private openGlobalLock;
    isDragging: boolean;
    private currentDirection;
    private originPoint;
    /**
     * The permitted boundaries of travel, in pixels.
     */
    private constraints;
    private hasMutatedConstraints;
    /**
     * The per-axis resolved elastic values.
     */
    private elastic;
    constructor(visualElement: VisualElement);
    start(originEvent: AnyPointerEvent, { snapToCursor }?: DragControlOptions): void;
    private stop;
    private cancel;
    private updateAxis;
    private resolveConstraints;
    private resolveRefConstraints;
    private startAnimation;
    private startAxisValueAnimation;
    private stopAnimation;
    /**
     * Drag works differently depending on which props are provided.
     *
     * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
     * - Otherwise, we apply the delta to the x/y motion values.
     */
    private getAxisMotionValue;
    private snapToCursor;
    /**
     * When the viewport resizes we want to check if the measured constraints
     * have changed and, if so, reposition the element within those new constraints
     * relative to where it was before the resize.
     */
    scalePositionWithinConstraints(): void;
    addListeners(): () => void;
    getProps(): MotionProps;
}

declare type VisualElementLifecycles = LayoutLifecycles & AnimationLifecycles;

declare type VisualElementOptions<Instance, RenderState = any> = {
    visualState: VisualState<Instance, RenderState>;
    parent?: VisualElement<unknown>;
    variantParent?: VisualElement<unknown>;
    presenceId?: number | undefined;
    props: MotionProps;
    blockInitialAnimation?: boolean;
    shouldReduceMotion?: boolean | null;
};

declare interface VisualState<Instance, RenderState> {
    renderState: RenderState;
    latestValues: ResolvedValues;
    mount?: (instance: Instance) => void;
}

declare interface WithDepth {
    depth: number;
}

export { }
