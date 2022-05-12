import sync from "framesync";
import { transform, TransformOptions } from './motion/packages/framer-motion/src/utils/transform';
import { MotionValue } from './motion/packages/framer-motion/src/value/index';
export { isMotionValue } from './motion/packages/framer-motion/src/value/utils/is-motion-value';
export { MotionValue} from './motion/packages/framer-motion/src/value/index';

export function motionValue<T>(init: T): MotionValue<T> {
    return new MotionValue<T>(init);
}

type InputRange = number[]
type SingleTransformer<I, O> = (input: I) => O
type MultiTransformer<I, O> = (input: I[]) => O
type Transformer<I, O> =
    | SingleTransformer<I, O>
    /**
     * Ideally, this would be typed <I, O> in all instances, but to type this
     * more accurately requires the tuple support in TypeScript 4:
     * https://gist.github.com/InventingWithMonster/c4d23752a0fae7888596c4ff6d92733a
     */
    | MultiTransformer<string | number, O>

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
export function useTransform<I, O>(
    value: MotionValue<number>,
    inputRange: InputRange,
    outputRange: O[],
    options?: TransformOptions<O>
): MotionValue<O>

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
export function useTransform<I, O>(
    input: MotionValue<I>,
    transformer: SingleTransformer<I, O>
): MotionValue<O>

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
export function useTransform<I, O>(
    input:
        | MotionValue<string>[]
        | MotionValue<number>[]
        | MotionValue<string | number>[],
    transformer: MultiTransformer<I, O>
): MotionValue<O>


export function useTransform<I, O>(
    input:
        | MotionValue<I>
        | MotionValue<string>[]
        | MotionValue<number>[]
        | MotionValue<string | number>[],
    inputRangeOrTransformer: InputRange | Transformer<I, O>,
    outputRange?: O[],
    options?: TransformOptions<O>
): MotionValue<O> {
    const transformer =
        typeof inputRangeOrTransformer === "function"
            ? inputRangeOrTransformer
            : transform(inputRangeOrTransformer, outputRange!, options)

    return Array.isArray(input)
        ? useListTransform(
            input as any,
            transformer as MultiTransformer<string | number, O>
        )
        : useListTransform([input], ([latest]) =>
            (transformer as SingleTransformer<I, O>)(latest)
        )
}

function useListTransform<I, O>(
    values: MotionValue<I>[],
    transformer: MultiTransformer<I, O>
): MotionValue<O> {
    const latest: I[] = []

    return useCombineMotionValues(values, () => {
        latest.length = 0
        const numValues = values.length
        for (let i = 0; i < numValues; i++) {
            latest[i] = values[i].get()
        }

        return transformer(latest)
    })
}


export function useCombineMotionValues<R>(
    values: MotionValue[],
    combineValues: () => R
) {
    /**
     * Initialise the returned motion value. This remains the same between renders.
     */
    const value = motionValue(combineValues())

    /**
     * Create a function that will update the template motion value with the latest values.
     * This is pre-bound so whenever a motion value updates it can schedule its
     * execution in Framesync. If it's already been scheduled it won't be fired twice
     * in a single frame.
     */
    const updateValue = () => value.set(combineValues())

    /**
     * Synchronously update the motion value with the latest values during the render.
     * This ensures that within a React render, the styles applied to the DOM are up-to-date.
     */
    updateValue()

    /**
     * Subscribe to all motion values found within the template. Whenever any of them change,
     * schedule an update.
     */
    const handler = () => sync.update(updateValue, false, true);
    const subscriptions = values.map((value) => value.onChange(handler))
    value.stop = () => subscriptions.forEach((unsubscribe) => unsubscribe());
    return value
}