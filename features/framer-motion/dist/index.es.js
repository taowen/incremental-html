var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
import { invariant, warning } from "hey-listen";
import { cubicBezier, linear, easeIn, easeInOut, easeOut, circIn, circInOut, circOut, backIn, backInOut, backOut, anticipate, bounceIn, bounceInOut, bounceOut, inertia, animate as animate$1, velocityPerSecond, distance, pipe, mix, clamp, progress, interpolate } from "popmotion";
import { complex, number, px, degrees, scale, alpha, progressPercentage, color, filter, percent, vw, vh } from "style-value-types";
import sync, { getFrameData, cancelSync, flushSync } from "framesync";
const secondsToMilliseconds = (seconds) => seconds * 1e3;
const easingLookup = {
  linear,
  easeIn,
  easeInOut,
  easeOut,
  circIn,
  circInOut,
  circOut,
  backIn,
  backInOut,
  backOut,
  anticipate,
  bounceIn,
  bounceInOut,
  bounceOut
};
const easingDefinitionToFunction = (definition) => {
  if (Array.isArray(definition)) {
    invariant(definition.length === 4, `Cubic bezier arrays must contain four numerical values.`);
    const [x1, y1, x2, y2] = definition;
    return cubicBezier(x1, y1, x2, y2);
  } else if (typeof definition === "string") {
    invariant(easingLookup[definition] !== void 0, `Invalid easing type '${definition}'`);
    return easingLookup[definition];
  }
  return definition;
};
const isEasingArray = (ease) => {
  return Array.isArray(ease) && typeof ease[0] !== "number";
};
const isAnimatable = (key, value) => {
  if (key === "zIndex")
    return false;
  if (typeof value === "number" || Array.isArray(value))
    return true;
  if (typeof value === "string" && complex.test(value) && !value.startsWith("url(")) {
    return true;
  }
  return false;
};
const isKeyframesTarget = (v2) => {
  return Array.isArray(v2);
};
const underDampedSpring = () => ({
  type: "spring",
  stiffness: 500,
  damping: 25,
  restSpeed: 10
});
const criticallyDampedSpring = (to) => ({
  type: "spring",
  stiffness: 550,
  damping: to === 0 ? 2 * Math.sqrt(550) : 30,
  restSpeed: 10
});
const linearTween = () => ({
  type: "keyframes",
  ease: "linear",
  duration: 0.3
});
const keyframes = (values) => ({
  type: "keyframes",
  duration: 0.8,
  values
});
const defaultTransitions = {
  x: underDampedSpring,
  y: underDampedSpring,
  z: underDampedSpring,
  rotate: underDampedSpring,
  rotateX: underDampedSpring,
  rotateY: underDampedSpring,
  rotateZ: underDampedSpring,
  scaleX: criticallyDampedSpring,
  scaleY: criticallyDampedSpring,
  scale: criticallyDampedSpring,
  opacity: linearTween,
  backgroundColor: linearTween,
  color: linearTween,
  default: criticallyDampedSpring
};
const getDefaultTransition = (valueKey, to) => {
  let transitionFactory;
  if (isKeyframesTarget(to)) {
    transitionFactory = keyframes;
  } else {
    transitionFactory = defaultTransitions[valueKey] || defaultTransitions.default;
  }
  return __spreadValues({ to }, transitionFactory(to));
};
const int = __spreadProps(__spreadValues({}, number), {
  transform: Math.round
});
const numberValueTypes = {
  borderWidth: px,
  borderTopWidth: px,
  borderRightWidth: px,
  borderBottomWidth: px,
  borderLeftWidth: px,
  borderRadius: px,
  radius: px,
  borderTopLeftRadius: px,
  borderTopRightRadius: px,
  borderBottomRightRadius: px,
  borderBottomLeftRadius: px,
  width: px,
  maxWidth: px,
  height: px,
  maxHeight: px,
  size: px,
  top: px,
  right: px,
  bottom: px,
  left: px,
  padding: px,
  paddingTop: px,
  paddingRight: px,
  paddingBottom: px,
  paddingLeft: px,
  margin: px,
  marginTop: px,
  marginRight: px,
  marginBottom: px,
  marginLeft: px,
  rotate: degrees,
  rotateX: degrees,
  rotateY: degrees,
  rotateZ: degrees,
  scale,
  scaleX: scale,
  scaleY: scale,
  scaleZ: scale,
  skew: degrees,
  skewX: degrees,
  skewY: degrees,
  distance: px,
  translateX: px,
  translateY: px,
  translateZ: px,
  x: px,
  y: px,
  z: px,
  perspective: px,
  transformPerspective: px,
  opacity: alpha,
  originX: progressPercentage,
  originY: progressPercentage,
  originZ: px,
  zIndex: int,
  fillOpacity: alpha,
  strokeOpacity: alpha,
  numOctaves: int
};
const defaultValueTypes = __spreadProps(__spreadValues({}, numberValueTypes), {
  color,
  backgroundColor: color,
  outlineColor: color,
  fill: color,
  stroke: color,
  borderColor: color,
  borderTopColor: color,
  borderRightColor: color,
  borderBottomColor: color,
  borderLeftColor: color,
  filter,
  WebkitFilter: filter
});
const getDefaultValueType = (key) => defaultValueTypes[key];
function getAnimatableNone(key, value) {
  var _a;
  let defaultValueType = getDefaultValueType(key);
  if (defaultValueType !== filter)
    defaultValueType = complex;
  return (_a = defaultValueType.getAnimatableNone) == null ? void 0 : _a.call(defaultValueType, value);
}
const isCustomValue = (v2) => {
  return Boolean(v2 && typeof v2 === "object" && v2.mix && v2.toValue);
};
const resolveFinalValueInKeyframes = (v2) => {
  return isKeyframesTarget(v2) ? v2[v2.length - 1] || 0 : v2;
};
function isTransitionDefined(_a) {
  var _b = _a, {
    when,
    delay,
    delayChildren,
    staggerChildren,
    staggerDirection,
    repeat,
    repeatType,
    repeatDelay,
    from
  } = _b, transition = __objRest(_b, [
    "when",
    "delay",
    "delayChildren",
    "staggerChildren",
    "staggerDirection",
    "repeat",
    "repeatType",
    "repeatDelay",
    "from"
  ]);
  return !!Object.keys(transition).length;
}
let legacyRepeatWarning = false;
function convertTransitionToAnimationOptions(_c) {
  var _d = _c, {
    ease,
    times,
    yoyo,
    flip,
    loop
  } = _d, transition = __objRest(_d, [
    "ease",
    "times",
    "yoyo",
    "flip",
    "loop"
  ]);
  const options = __spreadValues({}, transition);
  if (times)
    options["offset"] = times;
  if (transition.duration)
    options["duration"] = secondsToMilliseconds(transition.duration);
  if (transition.repeatDelay)
    options.repeatDelay = secondsToMilliseconds(transition.repeatDelay);
  if (ease) {
    options["ease"] = isEasingArray(ease) ? ease.map(easingDefinitionToFunction) : easingDefinitionToFunction(ease);
  }
  if (transition.type === "tween")
    options.type = "keyframes";
  if (yoyo || loop || flip) {
    warning(!legacyRepeatWarning, "yoyo, loop and flip have been removed from the API. Replace with repeat and repeatType options.");
    legacyRepeatWarning = true;
    if (yoyo) {
      options.repeatType = "reverse";
    } else if (loop) {
      options.repeatType = "loop";
    } else if (flip) {
      options.repeatType = "mirror";
    }
    options.repeat = loop || yoyo || flip || transition.repeat;
  }
  if (transition.type !== "spring")
    options.type = "keyframes";
  return options;
}
function getDelayFromTransition(transition, key) {
  var _a, _b;
  const valueTransition = getValueTransition(transition, key) || {};
  return (_b = (_a = valueTransition.delay) != null ? _a : transition.delay) != null ? _b : 0;
}
function hydrateKeyframes(options) {
  if (Array.isArray(options.to) && options.to[0] === null) {
    options.to = [...options.to];
    options.to[0] = options.from;
  }
  return options;
}
function getPopmotionAnimationOptions(transition, options, key) {
  var _a;
  if (Array.isArray(options.to)) {
    (_a = transition.duration) != null ? _a : transition.duration = 0.8;
  }
  hydrateKeyframes(options);
  if (!isTransitionDefined(transition)) {
    transition = __spreadValues(__spreadValues({}, transition), getDefaultTransition(key, options.to));
  }
  return __spreadValues(__spreadValues({}, options), convertTransitionToAnimationOptions(transition));
}
function getAnimation(key, value, target, transition, onComplete) {
  var _a;
  const valueTransition = getValueTransition(transition, key);
  let origin = (_a = valueTransition.from) != null ? _a : value.get();
  const isTargetAnimatable = isAnimatable(key, target);
  if (origin === "none" && isTargetAnimatable && typeof target === "string") {
    origin = getAnimatableNone(key, target);
  } else if (isZero(origin) && typeof target === "string") {
    origin = getZeroUnit(target);
  } else if (!Array.isArray(target) && isZero(target) && typeof origin === "string") {
    target = getZeroUnit(origin);
  }
  const isOriginAnimatable = isAnimatable(key, origin);
  warning(isOriginAnimatable === isTargetAnimatable, `You are trying to animate ${key} from "${origin}" to "${target}". ${origin} is not an animatable value - to enable this animation set ${origin} to a value animatable to ${target} via the \`style\` property.`);
  function start() {
    const options = {
      from: origin,
      to: target,
      velocity: value.getVelocity(),
      onComplete,
      onUpdate: (v2) => value.set(v2)
    };
    return valueTransition.type === "inertia" || valueTransition.type === "decay" ? inertia(__spreadValues(__spreadValues({}, options), valueTransition)) : animate$1(__spreadProps(__spreadValues({}, getPopmotionAnimationOptions(valueTransition, options, key)), {
      onUpdate: (v2) => {
        var _a2;
        options.onUpdate(v2);
        (_a2 = valueTransition.onUpdate) == null ? void 0 : _a2.call(valueTransition, v2);
      },
      onComplete: () => {
        var _a2;
        options.onComplete();
        (_a2 = valueTransition.onComplete) == null ? void 0 : _a2.call(valueTransition);
      }
    }));
  }
  function set() {
    var _a2, _b;
    const finalTarget = resolveFinalValueInKeyframes(target);
    value.set(finalTarget);
    onComplete();
    (_a2 = valueTransition == null ? void 0 : valueTransition.onUpdate) == null ? void 0 : _a2.call(valueTransition, finalTarget);
    (_b = valueTransition == null ? void 0 : valueTransition.onComplete) == null ? void 0 : _b.call(valueTransition);
    return { stop: () => {
    } };
  }
  return !isOriginAnimatable || !isTargetAnimatable || valueTransition.type === false ? set : start;
}
function isZero(value) {
  return value === 0 || typeof value === "string" && parseFloat(value) === 0 && value.indexOf(" ") === -1;
}
function getZeroUnit(potentialUnitType) {
  return typeof potentialUnitType === "number" ? 0 : getAnimatableNone("", potentialUnitType);
}
function getValueTransition(transition, key) {
  return transition[key] || transition["default"] || transition;
}
function startAnimation(key, value, target, transition = {}) {
  return value.start((onComplete) => {
    let delayTimer;
    let controls;
    const animation = getAnimation(key, value, target, transition, onComplete);
    const delay = getDelayFromTransition(transition, key);
    const start = () => controls = animation();
    if (delay) {
      delayTimer = window.setTimeout(start, secondsToMilliseconds(delay));
    } else {
      start();
    }
    return () => {
      clearTimeout(delayTimer);
      controls == null ? void 0 : controls.stop();
    };
  });
}
const isNumericalString = (v2) => /^\-?\d*\.?\d+$/.test(v2);
const isZeroValueString = (v2) => /^0[^.\s]+$/.test(v2);
function addUniqueItem(arr, item) {
  arr.indexOf(item) === -1 && arr.push(item);
}
function removeItem(arr, item) {
  const index = arr.indexOf(item);
  index > -1 && arr.splice(index, 1);
}
class SubscriptionManager {
  constructor() {
    this.subscriptions = [];
  }
  add(handler) {
    addUniqueItem(this.subscriptions, handler);
    return () => removeItem(this.subscriptions, handler);
  }
  notify(a, b, c) {
    const numSubscriptions = this.subscriptions.length;
    if (!numSubscriptions)
      return;
    if (numSubscriptions === 1) {
      this.subscriptions[0](a, b, c);
    } else {
      for (let i = 0; i < numSubscriptions; i++) {
        const handler = this.subscriptions[i];
        handler && handler(a, b, c);
      }
    }
  }
  getSize() {
    return this.subscriptions.length;
  }
  clear() {
    this.subscriptions.length = 0;
  }
}
const isFloat = (value) => {
  return !isNaN(parseFloat(value));
};
class MotionValue {
  constructor(init) {
    this.timeDelta = 0;
    this.lastUpdated = 0;
    this.updateSubscribers = new SubscriptionManager();
    this.velocityUpdateSubscribers = new SubscriptionManager();
    this.renderSubscribers = new SubscriptionManager();
    this.canTrackVelocity = false;
    this.updateAndNotify = (v2, render = true) => {
      this.prev = this.current;
      this.current = v2;
      const { delta, timestamp } = getFrameData();
      if (this.lastUpdated !== timestamp) {
        this.timeDelta = delta;
        this.lastUpdated = timestamp;
        sync.postRender(this.scheduleVelocityCheck);
      }
      if (this.prev !== this.current) {
        this.updateSubscribers.notify(this.current);
      }
      if (this.velocityUpdateSubscribers.getSize()) {
        this.velocityUpdateSubscribers.notify(this.getVelocity());
      }
      if (render) {
        this.renderSubscribers.notify(this.current);
      }
    };
    this.scheduleVelocityCheck = () => sync.postRender(this.velocityCheck);
    this.velocityCheck = ({ timestamp }) => {
      if (timestamp !== this.lastUpdated) {
        this.prev = this.current;
        this.velocityUpdateSubscribers.notify(this.getVelocity());
      }
    };
    this.hasAnimated = false;
    this.prev = this.current = init;
    this.canTrackVelocity = isFloat(this.current);
  }
  onChange(subscription) {
    return this.updateSubscribers.add(subscription);
  }
  clearListeners() {
    this.updateSubscribers.clear();
  }
  onRenderRequest(subscription) {
    subscription(this.get());
    return this.renderSubscribers.add(subscription);
  }
  attach(passiveEffect) {
    this.passiveEffect = passiveEffect;
  }
  set(v2, render = true) {
    if (!render || !this.passiveEffect) {
      this.updateAndNotify(v2, render);
    } else {
      this.passiveEffect(v2, this.updateAndNotify);
    }
  }
  get() {
    return this.current;
  }
  getPrevious() {
    return this.prev;
  }
  getVelocity() {
    return this.canTrackVelocity ? velocityPerSecond(parseFloat(this.current) - parseFloat(this.prev), this.timeDelta) : 0;
  }
  start(animation) {
    this.stop();
    return new Promise((resolve) => {
      this.hasAnimated = true;
      this.stopAnimation = animation(resolve);
    }).then(() => this.clearAnimation());
  }
  stop() {
    if (this.stopAnimation)
      this.stopAnimation();
    this.clearAnimation();
  }
  isAnimating() {
    return !!this.stopAnimation;
  }
  clearAnimation() {
    this.stopAnimation = null;
  }
  destroy() {
    this.updateSubscribers.clear();
    this.renderSubscribers.clear();
    this.stop();
  }
}
function motionValue$1(init) {
  return new MotionValue(init);
}
const testValueType = (v2) => (type) => type.test(v2);
const auto = {
  test: (v2) => v2 === "auto",
  parse: (v2) => v2
};
const dimensionValueTypes = [number, px, percent, degrees, vw, vh, auto];
const findDimensionValueType = (v2) => dimensionValueTypes.find(testValueType(v2));
const valueTypes = [...dimensionValueTypes, color, complex];
const findValueType = (v2) => valueTypes.find(testValueType(v2));
function isVariantLabels(v2) {
  return Array.isArray(v2);
}
function isVariantLabel(v2) {
  return typeof v2 === "string" || isVariantLabels(v2);
}
function getCurrent(visualElement2) {
  const current = {};
  visualElement2.forEachValue((value, key) => current[key] = value.get());
  return current;
}
function getVelocity$1(visualElement2) {
  const velocity = {};
  visualElement2.forEachValue((value, key) => velocity[key] = value.getVelocity());
  return velocity;
}
function resolveVariantFromProps(props, definition, custom, currentValues = {}, currentVelocity = {}) {
  var _a;
  if (typeof definition === "function") {
    definition = definition(custom != null ? custom : props.custom, currentValues, currentVelocity);
  }
  if (typeof definition === "string") {
    definition = (_a = props.variants) == null ? void 0 : _a[definition];
  }
  if (typeof definition === "function") {
    definition = definition(custom != null ? custom : props.custom, currentValues, currentVelocity);
  }
  return definition;
}
function resolveVariant(visualElement2, definition, custom) {
  const props = visualElement2.getProps();
  return resolveVariantFromProps(props, definition, custom != null ? custom : props.custom, getCurrent(visualElement2), getVelocity$1(visualElement2));
}
function checkIfControllingVariants(props) {
  var _a;
  return typeof ((_a = props.animate) == null ? void 0 : _a.start) === "function" || isVariantLabel(props.initial) || isVariantLabel(props.animate) || isVariantLabel(props.whileHover) || isVariantLabel(props.whileDrag) || isVariantLabel(props.whileTap) || isVariantLabel(props.whileFocus) || isVariantLabel(props.exit);
}
function checkIfVariantNode(props) {
  return Boolean(checkIfControllingVariants(props) || props.variants);
}
function setMotionValue(visualElement2, key, value) {
  if (visualElement2.hasValue(key)) {
    visualElement2.getValue(key).set(value);
  } else {
    visualElement2.addValue(key, motionValue$1(value));
  }
}
function setTarget(visualElement2, definition) {
  const resolved = resolveVariant(visualElement2, definition);
  let _a = resolved ? visualElement2.makeTargetAnimatable(resolved, false) : {}, {
    transitionEnd = {},
    transition = {}
  } = _a, target = __objRest(_a, [
    "transitionEnd",
    "transition"
  ]);
  target = __spreadValues(__spreadValues({}, target), transitionEnd);
  for (const key in target) {
    const value = resolveFinalValueInKeyframes(target[key]);
    setMotionValue(visualElement2, key, value);
  }
}
function setVariants(visualElement2, variantLabels) {
  const reversedLabels = [...variantLabels].reverse();
  reversedLabels.forEach((key) => {
    var _a;
    const variant = visualElement2.getVariant(key);
    variant && setTarget(visualElement2, variant);
    (_a = visualElement2.variantChildren) == null ? void 0 : _a.forEach((child) => {
      setVariants(child, variantLabels);
    });
  });
}
function setValues(visualElement2, definition) {
  if (Array.isArray(definition)) {
    return setVariants(visualElement2, definition);
  } else if (typeof definition === "string") {
    return setVariants(visualElement2, [definition]);
  } else {
    setTarget(visualElement2, definition);
  }
}
function checkTargetForNewValues(visualElement2, target, origin) {
  var _a, _b, _c;
  const newValueKeys = Object.keys(target).filter((key) => !visualElement2.hasValue(key));
  const numNewValues = newValueKeys.length;
  if (!numNewValues)
    return;
  for (let i = 0; i < numNewValues; i++) {
    const key = newValueKeys[i];
    const targetValue = target[key];
    let value = null;
    if (Array.isArray(targetValue)) {
      value = targetValue[0];
    }
    if (value === null) {
      value = (_b = (_a = origin[key]) != null ? _a : visualElement2.readValue(key)) != null ? _b : target[key];
    }
    if (value === void 0 || value === null)
      continue;
    if (typeof value === "string" && (isNumericalString(value) || isZeroValueString(value))) {
      value = parseFloat(value);
    } else if (!findValueType(value) && complex.test(targetValue)) {
      value = getAnimatableNone(key, targetValue);
    }
    visualElement2.addValue(key, motionValue$1(value));
    (_c = origin[key]) != null ? _c : origin[key] = value;
    visualElement2.setBaseTarget(key, value);
  }
}
function getOriginFromTransition(key, transition) {
  if (!transition)
    return;
  const valueTransition = transition[key] || transition["default"] || transition;
  return valueTransition.from;
}
function getOrigin(target, transition, visualElement2) {
  var _a, _b;
  const origin = {};
  for (const key in target) {
    origin[key] = (_b = getOriginFromTransition(key, transition)) != null ? _b : (_a = visualElement2.getValue(key)) == null ? void 0 : _a.get();
  }
  return origin;
}
const transformAxes = ["", "X", "Y", "Z"];
const order = ["translate", "scale", "rotate", "skew"];
const transformProps = ["transformPerspective", "x", "y", "z"];
order.forEach((operationKey) => transformAxes.forEach((axesKey) => transformProps.push(operationKey + axesKey)));
function sortTransformProps(a, b) {
  return transformProps.indexOf(a) - transformProps.indexOf(b);
}
const transformPropSet = new Set(transformProps);
function isTransformProp(key) {
  return transformPropSet.has(key);
}
const transformOriginProps = /* @__PURE__ */ new Set(["originX", "originY", "originZ"]);
function isTransformOriginProp(key) {
  return transformOriginProps.has(key);
}
function animateVisualElement(visualElement2, definition, options = {}) {
  visualElement2.notifyAnimationStart(definition);
  let animation;
  if (Array.isArray(definition)) {
    const animations = definition.map((variant) => animateVariant(visualElement2, variant, options));
    animation = Promise.all(animations);
  } else if (typeof definition === "string") {
    animation = animateVariant(visualElement2, definition, options);
  } else {
    const resolvedDefinition = typeof definition === "function" ? resolveVariant(visualElement2, definition, options.custom) : definition;
    animation = animateTarget(visualElement2, resolvedDefinition, options);
  }
  return animation.then(() => visualElement2.notifyAnimationComplete(definition));
}
function animateVariant(visualElement2, variant, options = {}) {
  var _a;
  const resolved = resolveVariant(visualElement2, variant, options.custom);
  let { transition = visualElement2.getDefaultTransition() || {} } = resolved || {};
  if (options.transitionOverride) {
    transition = options.transitionOverride;
  }
  const getAnimation2 = resolved ? () => animateTarget(visualElement2, resolved, options) : () => Promise.resolve();
  const getChildAnimations = ((_a = visualElement2.variantChildren) == null ? void 0 : _a.size) ? (forwardDelay = 0) => {
    const {
      delayChildren = 0,
      staggerChildren,
      staggerDirection
    } = transition;
    return animateChildren(visualElement2, variant, delayChildren + forwardDelay, staggerChildren, staggerDirection, options);
  } : () => Promise.resolve();
  const { when } = transition;
  if (when) {
    const [first, last] = when === "beforeChildren" ? [getAnimation2, getChildAnimations] : [getChildAnimations, getAnimation2];
    return first().then(last);
  } else {
    return Promise.all([getAnimation2(), getChildAnimations(options.delay)]);
  }
}
function animateTarget(visualElement2, definition, { delay = 0, transitionOverride, type } = {}) {
  var _b;
  let _a = visualElement2.makeTargetAnimatable(definition), {
    transition = visualElement2.getDefaultTransition(),
    transitionEnd
  } = _a, target = __objRest(_a, [
    "transition",
    "transitionEnd"
  ]);
  if (transitionOverride)
    transition = transitionOverride;
  const animations = [];
  const animationTypeState = type && ((_b = visualElement2.animationState) == null ? void 0 : _b.getState()[type]);
  for (const key in target) {
    const value = visualElement2.getValue(key);
    const valueTarget = target[key];
    if (!value || valueTarget === void 0 || animationTypeState && shouldBlockAnimation(animationTypeState, key)) {
      continue;
    }
    let valueTransition = __spreadValues({ delay }, transition);
    if (visualElement2.shouldReduceMotion && isTransformProp(key)) {
      valueTransition = __spreadProps(__spreadValues({}, valueTransition), {
        type: false,
        delay: 0
      });
    }
    const animation = startAnimation(key, value, valueTarget, valueTransition);
    animations.push(animation);
  }
  return Promise.all(animations).then(() => {
    transitionEnd && setTarget(visualElement2, transitionEnd);
  });
}
function animateChildren(visualElement2, variant, delayChildren = 0, staggerChildren = 0, staggerDirection = 1, options) {
  const animations = [];
  const maxStaggerDuration = (visualElement2.variantChildren.size - 1) * staggerChildren;
  const generateStaggerDuration = staggerDirection === 1 ? (i = 0) => i * staggerChildren : (i = 0) => maxStaggerDuration - i * staggerChildren;
  Array.from(visualElement2.variantChildren).sort(sortByTreeOrder).forEach((child, i) => {
    animations.push(animateVariant(child, variant, __spreadProps(__spreadValues({}, options), {
      delay: delayChildren + generateStaggerDuration(i)
    })).then(() => child.notifyAnimationComplete(variant)));
  });
  return Promise.all(animations);
}
function stopAnimation(visualElement2) {
  visualElement2.forEachValue((value) => value.stop());
}
function sortByTreeOrder(a, b) {
  return a.sortNodePosition(b);
}
function shouldBlockAnimation({ protectedKeys, needsAnimating }, key) {
  const shouldBlock = protectedKeys.hasOwnProperty(key) && needsAnimating[key] !== true;
  needsAnimating[key] = false;
  return shouldBlock;
}
function animationControls() {
  let hasMounted = false;
  const pendingAnimations = [];
  const subscribers = /* @__PURE__ */ new Set();
  const controls = {
    subscribe(visualElement2) {
      subscribers.add(visualElement2);
      return () => void subscribers.delete(visualElement2);
    },
    start(definition, transitionOverride) {
      if (hasMounted) {
        const animations = [];
        subscribers.forEach((visualElement2) => {
          animations.push(animateVisualElement(visualElement2, definition, {
            transitionOverride
          }));
        });
        return Promise.all(animations);
      } else {
        return new Promise((resolve) => {
          pendingAnimations.push({
            animation: [definition, transitionOverride],
            resolve
          });
        });
      }
    },
    set(definition) {
      invariant(hasMounted, "controls.set() should only be called after a component has mounted. Consider calling within a useEffect hook.");
      return subscribers.forEach((visualElement2) => {
        setValues(visualElement2, definition);
      });
    },
    stop() {
      subscribers.forEach((visualElement2) => {
        stopAnimation(visualElement2);
      });
    },
    mount() {
      hasMounted = true;
      pendingAnimations.forEach(({ animation, resolve }) => {
        controls.start(...animation).then(resolve);
      });
      return () => {
        hasMounted = false;
        controls.stop();
      };
    }
  };
  return controls;
}
var react_production_min = {};
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
  if (val === null || val === void 0) {
    throw new TypeError("Object.assign cannot be called with null or undefined");
  }
  return Object(val);
}
function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    }
    var test1 = new String("abc");
    test1[5] = "de";
    if (Object.getOwnPropertyNames(test1)[0] === "5") {
      return false;
    }
    var test2 = {};
    for (var i = 0; i < 10; i++) {
      test2["_" + String.fromCharCode(i)] = i;
    }
    var order2 = Object.getOwnPropertyNames(test2).map(function(n2) {
      return test2[n2];
    });
    if (order2.join("") !== "0123456789") {
      return false;
    }
    var test3 = {};
    "abcdefghijklmnopqrst".split("").forEach(function(letter) {
      test3[letter] = letter;
    });
    if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
var objectAssign = shouldUseNative() ? Object.assign : function(target, source) {
  var from;
  var to = toObject(target);
  var symbols;
  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);
    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);
      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }
  return to;
};
/** @license React v17.0.2
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var l = objectAssign, n = 60103, p = 60106;
react_production_min.Fragment = 60107;
react_production_min.StrictMode = 60108;
react_production_min.Profiler = 60114;
var q = 60109, r = 60110, t = 60112;
react_production_min.Suspense = 60113;
var u = 60115, v = 60116;
if (typeof Symbol === "function" && Symbol.for) {
  var w = Symbol.for;
  n = w("react.element");
  p = w("react.portal");
  react_production_min.Fragment = w("react.fragment");
  react_production_min.StrictMode = w("react.strict_mode");
  react_production_min.Profiler = w("react.profiler");
  q = w("react.provider");
  r = w("react.context");
  t = w("react.forward_ref");
  react_production_min.Suspense = w("react.suspense");
  u = w("react.memo");
  v = w("react.lazy");
}
var x = typeof Symbol === "function" && Symbol.iterator;
function y(a) {
  if (a === null || typeof a !== "object")
    return null;
  a = x && a[x] || a["@@iterator"];
  return typeof a === "function" ? a : null;
}
function z(a) {
  for (var b = "https://reactjs.org/docs/error-decoder.html?invariant=" + a, c = 1; c < arguments.length; c++)
    b += "&args[]=" + encodeURIComponent(arguments[c]);
  return "Minified React error #" + a + "; visit " + b + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var A = { isMounted: function() {
  return false;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, B = {};
function C(a, b, c) {
  this.props = a;
  this.context = b;
  this.refs = B;
  this.updater = c || A;
}
C.prototype.isReactComponent = {};
C.prototype.setState = function(a, b) {
  if (typeof a !== "object" && typeof a !== "function" && a != null)
    throw Error(z(85));
  this.updater.enqueueSetState(this, a, b, "setState");
};
C.prototype.forceUpdate = function(a) {
  this.updater.enqueueForceUpdate(this, a, "forceUpdate");
};
function D() {
}
D.prototype = C.prototype;
function E(a, b, c) {
  this.props = a;
  this.context = b;
  this.refs = B;
  this.updater = c || A;
}
var F = E.prototype = new D();
F.constructor = E;
l(F, C.prototype);
F.isPureReactComponent = true;
var G = { current: null }, H = Object.prototype.hasOwnProperty, I = { key: true, ref: true, __self: true, __source: true };
function J(a, b, c) {
  var e, d = {}, k = null, h = null;
  if (b != null)
    for (e in b.ref !== void 0 && (h = b.ref), b.key !== void 0 && (k = "" + b.key), b)
      H.call(b, e) && !I.hasOwnProperty(e) && (d[e] = b[e]);
  var g = arguments.length - 2;
  if (g === 1)
    d.children = c;
  else if (1 < g) {
    for (var f = Array(g), m = 0; m < g; m++)
      f[m] = arguments[m + 2];
    d.children = f;
  }
  if (a && a.defaultProps)
    for (e in g = a.defaultProps, g)
      d[e] === void 0 && (d[e] = g[e]);
  return { $$typeof: n, type: a, key: k, ref: h, props: d, _owner: G.current };
}
function K(a, b) {
  return { $$typeof: n, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
}
function L(a) {
  return typeof a === "object" && a !== null && a.$$typeof === n;
}
function escape(a) {
  var b = { "=": "=0", ":": "=2" };
  return "$" + a.replace(/[=:]/g, function(a2) {
    return b[a2];
  });
}
var M = /\/+/g;
function N(a, b) {
  return typeof a === "object" && a !== null && a.key != null ? escape("" + a.key) : b.toString(36);
}
function O(a, b, c, e, d) {
  var k = typeof a;
  if (k === "undefined" || k === "boolean")
    a = null;
  var h = false;
  if (a === null)
    h = true;
  else
    switch (k) {
      case "string":
      case "number":
        h = true;
        break;
      case "object":
        switch (a.$$typeof) {
          case n:
          case p:
            h = true;
        }
    }
  if (h)
    return h = a, d = d(h), a = e === "" ? "." + N(h, 0) : e, Array.isArray(d) ? (c = "", a != null && (c = a.replace(M, "$&/") + "/"), O(d, b, c, "", function(a2) {
      return a2;
    })) : d != null && (L(d) && (d = K(d, c + (!d.key || h && h.key === d.key ? "" : ("" + d.key).replace(M, "$&/") + "/") + a)), b.push(d)), 1;
  h = 0;
  e = e === "" ? "." : e + ":";
  if (Array.isArray(a))
    for (var g = 0; g < a.length; g++) {
      k = a[g];
      var f = e + N(k, g);
      h += O(k, b, c, f, d);
    }
  else if (f = y(a), typeof f === "function")
    for (a = f.call(a), g = 0; !(k = a.next()).done; )
      k = k.value, f = e + N(k, g++), h += O(k, b, c, f, d);
  else if (k === "object")
    throw b = "" + a, Error(z(31, b === "[object Object]" ? "object with keys {" + Object.keys(a).join(", ") + "}" : b));
  return h;
}
function P(a, b, c) {
  if (a == null)
    return a;
  var e = [], d = 0;
  O(a, e, "", "", function(a2) {
    return b.call(c, a2, d++);
  });
  return e;
}
function Q(a) {
  if (a._status === -1) {
    var b = a._result;
    b = b();
    a._status = 0;
    a._result = b;
    b.then(function(b2) {
      a._status === 0 && (b2 = b2.default, a._status = 1, a._result = b2);
    }, function(b2) {
      a._status === 0 && (a._status = 2, a._result = b2);
    });
  }
  if (a._status === 1)
    return a._result;
  throw a._result;
}
var R = { current: null };
function S() {
  var a = R.current;
  if (a === null)
    throw Error(z(321));
  return a;
}
var T = { ReactCurrentDispatcher: R, ReactCurrentBatchConfig: { transition: 0 }, ReactCurrentOwner: G, IsSomeRendererActing: { current: false }, assign: l };
react_production_min.Children = { map: P, forEach: function(a, b, c) {
  P(a, function() {
    b.apply(this, arguments);
  }, c);
}, count: function(a) {
  var b = 0;
  P(a, function() {
    b++;
  });
  return b;
}, toArray: function(a) {
  return P(a, function(a2) {
    return a2;
  }) || [];
}, only: function(a) {
  if (!L(a))
    throw Error(z(143));
  return a;
} };
react_production_min.Component = C;
react_production_min.PureComponent = E;
react_production_min.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = T;
react_production_min.cloneElement = function(a, b, c) {
  if (a === null || a === void 0)
    throw Error(z(267, a));
  var e = l({}, a.props), d = a.key, k = a.ref, h = a._owner;
  if (b != null) {
    b.ref !== void 0 && (k = b.ref, h = G.current);
    b.key !== void 0 && (d = "" + b.key);
    if (a.type && a.type.defaultProps)
      var g = a.type.defaultProps;
    for (f in b)
      H.call(b, f) && !I.hasOwnProperty(f) && (e[f] = b[f] === void 0 && g !== void 0 ? g[f] : b[f]);
  }
  var f = arguments.length - 2;
  if (f === 1)
    e.children = c;
  else if (1 < f) {
    g = Array(f);
    for (var m = 0; m < f; m++)
      g[m] = arguments[m + 2];
    e.children = g;
  }
  return {
    $$typeof: n,
    type: a.type,
    key: d,
    ref: k,
    props: e,
    _owner: h
  };
};
react_production_min.createContext = function(a, b) {
  b === void 0 && (b = null);
  a = { $$typeof: r, _calculateChangedBits: b, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null };
  a.Provider = { $$typeof: q, _context: a };
  return a.Consumer = a;
};
react_production_min.createElement = J;
react_production_min.createFactory = function(a) {
  var b = J.bind(null, a);
  b.type = a;
  return b;
};
react_production_min.createRef = function() {
  return { current: null };
};
react_production_min.forwardRef = function(a) {
  return { $$typeof: t, render: a };
};
react_production_min.isValidElement = L;
react_production_min.lazy = function(a) {
  return { $$typeof: v, _payload: { _status: -1, _result: a }, _init: Q };
};
react_production_min.memo = function(a, b) {
  return { $$typeof: u, type: a, compare: b === void 0 ? null : b };
};
react_production_min.useCallback = function(a, b) {
  return S().useCallback(a, b);
};
react_production_min.useContext = function(a, b) {
  return S().useContext(a, b);
};
react_production_min.useDebugValue = function() {
};
react_production_min.useEffect = function(a, b) {
  return S().useEffect(a, b);
};
react_production_min.useImperativeHandle = function(a, b, c) {
  return S().useImperativeHandle(a, b, c);
};
react_production_min.useLayoutEffect = function(a, b) {
  return S().useLayoutEffect(a, b);
};
react_production_min.useMemo = function(a, b) {
  return S().useMemo(a, b);
};
react_production_min.useReducer = function(a, b, c) {
  return S().useReducer(a, b, c);
};
react_production_min.useRef = function(a) {
  return S().useRef(a);
};
react_production_min.useState = function(a) {
  return S().useState(a);
};
react_production_min.version = "17.0.2";
function addDomEvent(target, eventName, handler, options) {
  target.addEventListener(eventName, handler, options);
  return () => target.removeEventListener(eventName, handler, options);
}
function isMouseEvent(event) {
  if (typeof PointerEvent !== "undefined" && event instanceof PointerEvent) {
    return !!(event.pointerType === "mouse");
  }
  return event instanceof MouseEvent;
}
function isTouchEvent(event) {
  const hasTouches = !!event.touches;
  return hasTouches;
}
function filterPrimaryPointer(eventHandler) {
  return (event) => {
    const isMouseEvent2 = event instanceof MouseEvent;
    const isPrimaryPointer = !isMouseEvent2 || isMouseEvent2 && event.button === 0;
    if (isPrimaryPointer) {
      eventHandler(event);
    }
  };
}
const defaultPagePoint = { pageX: 0, pageY: 0 };
function pointFromTouch(e, pointType = "page") {
  const primaryTouch = e.touches[0] || e.changedTouches[0];
  const point = primaryTouch || defaultPagePoint;
  return {
    x: point[pointType + "X"],
    y: point[pointType + "Y"]
  };
}
function pointFromMouse(point, pointType = "page") {
  return {
    x: point[pointType + "X"],
    y: point[pointType + "Y"]
  };
}
function extractEventInfo(event, pointType = "page") {
  return {
    point: isTouchEvent(event) ? pointFromTouch(event, pointType) : pointFromMouse(event, pointType)
  };
}
const wrapHandler = (handler, shouldFilterPrimaryPointer = false) => {
  const listener = (event) => handler(event, extractEventInfo(event));
  return shouldFilterPrimaryPointer ? filterPrimaryPointer(listener) : listener;
};
const isBrowser = typeof document !== "undefined";
const supportsPointerEvents = () => isBrowser && window.onpointerdown === null;
const supportsTouchEvents = () => isBrowser && window.ontouchstart === null;
const supportsMouseEvents = () => isBrowser && window.onmousedown === null;
const mouseEventNames = {
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointercancel: "mousecancel",
  pointerover: "mouseover",
  pointerout: "mouseout",
  pointerenter: "mouseenter",
  pointerleave: "mouseleave"
};
const touchEventNames = {
  pointerdown: "touchstart",
  pointermove: "touchmove",
  pointerup: "touchend",
  pointercancel: "touchcancel"
};
function getPointerEventName(name) {
  if (supportsPointerEvents()) {
    return name;
  } else if (supportsTouchEvents()) {
    return touchEventNames[name];
  } else if (supportsMouseEvents()) {
    return mouseEventNames[name];
  }
  return name;
}
function addPointerEvent(target, eventName, handler, options) {
  return addDomEvent(target, getPointerEventName(eventName), wrapHandler(handler, eventName === "pointerdown"), options);
}
class PanSession {
  constructor(event, handlers, { transformPagePoint } = {}) {
    this.startEvent = null;
    this.lastMoveEvent = null;
    this.lastMoveEventInfo = null;
    this.handlers = {};
    this.updatePoint = () => {
      if (!(this.lastMoveEvent && this.lastMoveEventInfo))
        return;
      const info2 = getPanInfo(this.lastMoveEventInfo, this.history);
      const isPanStarted = this.startEvent !== null;
      const isDistancePastThreshold = distance(info2.offset, { x: 0, y: 0 }) >= 3;
      if (!isPanStarted && !isDistancePastThreshold)
        return;
      const { point: point2 } = info2;
      const { timestamp: timestamp2 } = getFrameData();
      this.history.push(__spreadProps(__spreadValues({}, point2), { timestamp: timestamp2 }));
      const { onStart, onMove } = this.handlers;
      if (!isPanStarted) {
        onStart && onStart(this.lastMoveEvent, info2);
        this.startEvent = this.lastMoveEvent;
      }
      onMove && onMove(this.lastMoveEvent, info2);
    };
    this.handlePointerMove = (event2, info2) => {
      this.lastMoveEvent = event2;
      this.lastMoveEventInfo = transformPoint(info2, this.transformPagePoint);
      if (isMouseEvent(event2) && event2.buttons === 0) {
        this.handlePointerUp(event2, info2);
        return;
      }
      sync.update(this.updatePoint, true);
    };
    this.handlePointerUp = (event2, info2) => {
      this.end();
      const { onEnd, onSessionEnd } = this.handlers;
      const panInfo = getPanInfo(transformPoint(info2, this.transformPagePoint), this.history);
      if (this.startEvent && onEnd) {
        onEnd(event2, panInfo);
      }
      onSessionEnd && onSessionEnd(event2, panInfo);
    };
    if (isTouchEvent(event) && event.touches.length > 1)
      return;
    this.handlers = handlers;
    this.transformPagePoint = transformPagePoint;
    const info = extractEventInfo(event);
    const initialInfo = transformPoint(info, this.transformPagePoint);
    const { point } = initialInfo;
    const { timestamp } = getFrameData();
    this.history = [__spreadProps(__spreadValues({}, point), { timestamp })];
    const { onSessionStart } = handlers;
    onSessionStart && onSessionStart(event, getPanInfo(initialInfo, this.history));
    this.removeListeners = pipe(addPointerEvent(window, "pointermove", this.handlePointerMove), addPointerEvent(window, "pointerup", this.handlePointerUp), addPointerEvent(window, "pointercancel", this.handlePointerUp));
  }
  updateHandlers(handlers) {
    this.handlers = handlers;
  }
  end() {
    this.removeListeners && this.removeListeners();
    cancelSync.update(this.updatePoint);
  }
}
function transformPoint(info, transformPagePoint) {
  return transformPagePoint ? { point: transformPagePoint(info.point) } : info;
}
function subtractPoint(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}
function getPanInfo({ point }, history) {
  return {
    point,
    delta: subtractPoint(point, lastDevicePoint(history)),
    offset: subtractPoint(point, startDevicePoint(history)),
    velocity: getVelocity(history, 0.1)
  };
}
function startDevicePoint(history) {
  return history[0];
}
function lastDevicePoint(history) {
  return history[history.length - 1];
}
function getVelocity(history, timeDelta) {
  if (history.length < 2) {
    return { x: 0, y: 0 };
  }
  let i = history.length - 1;
  let timestampedPoint = null;
  const lastPoint = lastDevicePoint(history);
  while (i >= 0) {
    timestampedPoint = history[i];
    if (lastPoint.timestamp - timestampedPoint.timestamp > secondsToMilliseconds(timeDelta)) {
      break;
    }
    i--;
  }
  if (!timestampedPoint) {
    return { x: 0, y: 0 };
  }
  const time = (lastPoint.timestamp - timestampedPoint.timestamp) / 1e3;
  if (time === 0) {
    return { x: 0, y: 0 };
  }
  const currentVelocity = {
    x: (lastPoint.x - timestampedPoint.x) / time,
    y: (lastPoint.y - timestampedPoint.y) / time
  };
  if (currentVelocity.x === Infinity) {
    currentVelocity.x = 0;
  }
  if (currentVelocity.y === Infinity) {
    currentVelocity.y = 0;
  }
  return currentVelocity;
}
function createLock(name) {
  let lock = null;
  return () => {
    const openLock = () => {
      lock = null;
    };
    if (lock === null) {
      lock = name;
      return openLock;
    }
    return false;
  };
}
const globalHorizontalLock = createLock("dragHorizontal");
const globalVerticalLock = createLock("dragVertical");
function getGlobalLock(drag) {
  let lock = false;
  if (drag === "y") {
    lock = globalVerticalLock();
  } else if (drag === "x") {
    lock = globalHorizontalLock();
  } else {
    const openHorizontal = globalHorizontalLock();
    const openVertical = globalVerticalLock();
    if (openHorizontal && openVertical) {
      lock = () => {
        openHorizontal();
        openVertical();
      };
    } else {
      if (openHorizontal)
        openHorizontal();
      if (openVertical)
        openVertical();
    }
  }
  return lock;
}
function isDragActive() {
  const openGestureLock = getGlobalLock(true);
  if (!openGestureLock)
    return true;
  openGestureLock();
  return false;
}
function isRefObject(ref) {
  return typeof ref === "object" && Object.prototype.hasOwnProperty.call(ref, "current");
}
function calcLength(axis) {
  return axis.max - axis.min;
}
function isNear(value, target = 0, maxDistance = 0.01) {
  return distance(value, target) < maxDistance;
}
function calcAxisDelta(delta, source, target, origin = 0.5) {
  delta.origin = origin;
  delta.originPoint = mix(source.min, source.max, delta.origin);
  delta.scale = calcLength(target) / calcLength(source);
  if (isNear(delta.scale, 1, 1e-4) || isNaN(delta.scale))
    delta.scale = 1;
  delta.translate = mix(target.min, target.max, delta.origin) - delta.originPoint;
  if (isNear(delta.translate) || isNaN(delta.translate))
    delta.translate = 0;
}
function calcBoxDelta(delta, source, target, origin) {
  calcAxisDelta(delta.x, source.x, target.x, origin == null ? void 0 : origin.originX);
  calcAxisDelta(delta.y, source.y, target.y, origin == null ? void 0 : origin.originY);
}
function calcRelativeAxis(target, relative, parent) {
  target.min = parent.min + relative.min;
  target.max = target.min + calcLength(relative);
}
function calcRelativeBox(target, relative, parent) {
  calcRelativeAxis(target.x, relative.x, parent.x);
  calcRelativeAxis(target.y, relative.y, parent.y);
}
function calcRelativeAxisPosition(target, layout, parent) {
  target.min = layout.min - parent.min;
  target.max = target.min + calcLength(layout);
}
function calcRelativePosition(target, layout, parent) {
  calcRelativeAxisPosition(target.x, layout.x, parent.x);
  calcRelativeAxisPosition(target.y, layout.y, parent.y);
}
function applyConstraints(point, { min, max }, elastic) {
  if (min !== void 0 && point < min) {
    point = elastic ? mix(min, point, elastic.min) : Math.max(point, min);
  } else if (max !== void 0 && point > max) {
    point = elastic ? mix(max, point, elastic.max) : Math.min(point, max);
  }
  return point;
}
function calcRelativeAxisConstraints(axis, min, max) {
  return {
    min: min !== void 0 ? axis.min + min : void 0,
    max: max !== void 0 ? axis.max + max - (axis.max - axis.min) : void 0
  };
}
function calcRelativeConstraints(layoutBox, { top, left, bottom, right }) {
  return {
    x: calcRelativeAxisConstraints(layoutBox.x, left, right),
    y: calcRelativeAxisConstraints(layoutBox.y, top, bottom)
  };
}
function calcViewportAxisConstraints(layoutAxis, constraintsAxis) {
  let min = constraintsAxis.min - layoutAxis.min;
  let max = constraintsAxis.max - layoutAxis.max;
  if (constraintsAxis.max - constraintsAxis.min < layoutAxis.max - layoutAxis.min) {
    [min, max] = [max, min];
  }
  return { min, max };
}
function calcViewportConstraints(layoutBox, constraintsBox) {
  return {
    x: calcViewportAxisConstraints(layoutBox.x, constraintsBox.x),
    y: calcViewportAxisConstraints(layoutBox.y, constraintsBox.y)
  };
}
function calcOrigin$1(source, target) {
  let origin = 0.5;
  const sourceLength = calcLength(source);
  const targetLength = calcLength(target);
  if (targetLength > sourceLength) {
    origin = progress(target.min, target.max - sourceLength, source.min);
  } else if (sourceLength > targetLength) {
    origin = progress(source.min, source.max - targetLength, target.min);
  }
  return clamp(0, 1, origin);
}
function rebaseAxisConstraints(layout, constraints) {
  const relativeConstraints = {};
  if (constraints.min !== void 0) {
    relativeConstraints.min = constraints.min - layout.min;
  }
  if (constraints.max !== void 0) {
    relativeConstraints.max = constraints.max - layout.min;
  }
  return relativeConstraints;
}
const defaultElastic = 0.35;
function resolveDragElastic(dragElastic = defaultElastic) {
  if (dragElastic === false) {
    dragElastic = 0;
  } else if (dragElastic === true) {
    dragElastic = defaultElastic;
  }
  return {
    x: resolveAxisElastic(dragElastic, "left", "right"),
    y: resolveAxisElastic(dragElastic, "top", "bottom")
  };
}
function resolveAxisElastic(dragElastic, minLabel, maxLabel) {
  return {
    min: resolvePointElastic(dragElastic, minLabel),
    max: resolvePointElastic(dragElastic, maxLabel)
  };
}
function resolvePointElastic(dragElastic, label) {
  var _a;
  return typeof dragElastic === "number" ? dragElastic : (_a = dragElastic[label]) != null ? _a : 0;
}
var AnimationType = /* @__PURE__ */ ((AnimationType2) => {
  AnimationType2["Animate"] = "animate";
  AnimationType2["Hover"] = "whileHover";
  AnimationType2["Tap"] = "whileTap";
  AnimationType2["Drag"] = "whileDrag";
  AnimationType2["Focus"] = "whileFocus";
  AnimationType2["InView"] = "whileInView";
  AnimationType2["Exit"] = "exit";
  return AnimationType2;
})(AnimationType || {});
const createAxisDelta = () => ({
  translate: 0,
  scale: 1,
  origin: 0,
  originPoint: 0
});
const createDelta = () => ({
  x: createAxisDelta(),
  y: createAxisDelta()
});
const createAxis = () => ({ min: 0, max: 0 });
const createBox = () => ({
  x: createAxis(),
  y: createAxis()
});
function eachAxis(callback) {
  return [callback("x"), callback("y")];
}
function convertBoundingBoxToBox({
  top,
  left,
  right,
  bottom
}) {
  return {
    x: { min: left, max: right },
    y: { min: top, max: bottom }
  };
}
function convertBoxToBoundingBox({ x: x2, y: y2 }) {
  return { top: y2.min, right: x2.max, bottom: y2.max, left: x2.min };
}
function transformBoxPoints(point, transformPoint2) {
  if (!transformPoint2)
    return point;
  const topLeft = transformPoint2({ x: point.left, y: point.top });
  const bottomRight = transformPoint2({ x: point.right, y: point.bottom });
  return {
    top: topLeft.y,
    left: topLeft.x,
    bottom: bottomRight.y,
    right: bottomRight.x
  };
}
function isIdentityScale(scale2) {
  return scale2 === void 0 || scale2 === 1;
}
function hasScale({ scale: scale2, scaleX, scaleY }) {
  return !isIdentityScale(scale2) || !isIdentityScale(scaleX) || !isIdentityScale(scaleY);
}
function hasTransform(values) {
  return hasScale(values) || hasTranslate(values.x) || hasTranslate(values.y) || values.z || values.rotate || values.rotateX || values.rotateY;
}
function hasTranslate(value) {
  return value && value !== "0%";
}
function scalePoint(point, scale2, originPoint) {
  const distanceFromOrigin = point - originPoint;
  const scaled = scale2 * distanceFromOrigin;
  return originPoint + scaled;
}
function applyPointDelta(point, translate, scale2, originPoint, boxScale) {
  if (boxScale !== void 0) {
    point = scalePoint(point, boxScale, originPoint);
  }
  return scalePoint(point, scale2, originPoint) + translate;
}
function applyAxisDelta(axis, translate = 0, scale2 = 1, originPoint, boxScale) {
  axis.min = applyPointDelta(axis.min, translate, scale2, originPoint, boxScale);
  axis.max = applyPointDelta(axis.max, translate, scale2, originPoint, boxScale);
}
function applyBoxDelta(box, { x: x2, y: y2 }) {
  applyAxisDelta(box.x, x2.translate, x2.scale, x2.originPoint);
  applyAxisDelta(box.y, y2.translate, y2.scale, y2.originPoint);
}
function applyTreeDeltas(box, treeScale, treePath, isSharedTransition = false) {
  var _a, _b;
  const treeLength = treePath.length;
  if (!treeLength)
    return;
  treeScale.x = treeScale.y = 1;
  let node;
  let delta;
  for (let i = 0; i < treeLength; i++) {
    node = treePath[i];
    delta = node.projectionDelta;
    if (((_b = (_a = node.instance) == null ? void 0 : _a.style) == null ? void 0 : _b.display) === "contents")
      continue;
    if (isSharedTransition && node.options.layoutScroll && node.scroll && node !== node.root) {
      transformBox(box, { x: -node.scroll.x, y: -node.scroll.y });
    }
    if (delta) {
      treeScale.x *= delta.x.scale;
      treeScale.y *= delta.y.scale;
      applyBoxDelta(box, delta);
    }
    if (isSharedTransition && hasTransform(node.latestValues)) {
      transformBox(box, node.latestValues);
    }
  }
}
function translateAxis(axis, distance2) {
  axis.min = axis.min + distance2;
  axis.max = axis.max + distance2;
}
function transformAxis(axis, transforms, [key, scaleKey, originKey]) {
  const axisOrigin = transforms[originKey] !== void 0 ? transforms[originKey] : 0.5;
  const originPoint = mix(axis.min, axis.max, axisOrigin);
  applyAxisDelta(axis, transforms[key], transforms[scaleKey], originPoint, transforms.scale);
}
const xKeys$1 = ["x", "scaleX", "originX"];
const yKeys$1 = ["y", "scaleY", "originY"];
function transformBox(box, transform2) {
  transformAxis(box.x, transform2, xKeys$1);
  transformAxis(box.y, transform2, yKeys$1);
}
function measureViewportBox(instance, transformPoint2) {
  return convertBoundingBoxToBox(transformBoxPoints(instance.getBoundingClientRect(), transformPoint2));
}
function measurePageBox(element, rootProjectionNode2, transformPagePoint) {
  const viewportBox = measureViewportBox(element, transformPagePoint);
  const { scroll } = rootProjectionNode2;
  if (scroll) {
    translateAxis(viewportBox.x, scroll.x);
    translateAxis(viewportBox.y, scroll.y);
  }
  return viewportBox;
}
const elementDragControls = /* @__PURE__ */ new WeakMap();
class VisualElementDragControls {
  constructor(visualElement2) {
    this.openGlobalLock = null;
    this.isDragging = false;
    this.currentDirection = null;
    this.originPoint = { x: 0, y: 0 };
    this.constraints = false;
    this.hasMutatedConstraints = false;
    this.elastic = createBox();
    this.visualElement = visualElement2;
  }
  start(originEvent, { snapToCursor = false } = {}) {
    if (this.visualElement.isPresent === false)
      return;
    const onSessionStart = (event) => {
      this.stopAnimation();
      if (snapToCursor) {
        this.snapToCursor(extractEventInfo(event, "page").point);
      }
    };
    const onStart = (event, info) => {
      var _a;
      const { drag, dragPropagation, onDragStart } = this.getProps();
      if (drag && !dragPropagation) {
        if (this.openGlobalLock)
          this.openGlobalLock();
        this.openGlobalLock = getGlobalLock(drag);
        if (!this.openGlobalLock)
          return;
      }
      this.isDragging = true;
      this.currentDirection = null;
      this.resolveConstraints();
      if (this.visualElement.projection) {
        this.visualElement.projection.isAnimationBlocked = true;
        this.visualElement.projection.target = void 0;
      }
      eachAxis((axis) => {
        var _a2, _b;
        let current = this.getAxisMotionValue(axis).get() || 0;
        if (percent.test(current)) {
          const measuredAxis = (_b = (_a2 = this.visualElement.projection) == null ? void 0 : _a2.layout) == null ? void 0 : _b.actual[axis];
          if (measuredAxis) {
            const length = calcLength(measuredAxis);
            current = length * (parseFloat(current) / 100);
          }
        }
        this.originPoint[axis] = current;
      });
      onDragStart == null ? void 0 : onDragStart(event, info);
      (_a = this.visualElement.animationState) == null ? void 0 : _a.setActive(AnimationType.Drag, true);
    };
    const onMove = (event, info) => {
      const {
        dragPropagation,
        dragDirectionLock,
        onDirectionLock,
        onDrag
      } = this.getProps();
      if (!dragPropagation && !this.openGlobalLock)
        return;
      const { offset } = info;
      if (dragDirectionLock && this.currentDirection === null) {
        this.currentDirection = getCurrentDirection(offset);
        if (this.currentDirection !== null) {
          onDirectionLock == null ? void 0 : onDirectionLock(this.currentDirection);
        }
        return;
      }
      this.updateAxis("x", info.point, offset);
      this.updateAxis("y", info.point, offset);
      this.visualElement.syncRender();
      onDrag == null ? void 0 : onDrag(event, info);
    };
    const onSessionEnd = (event, info) => this.stop(event, info);
    this.panSession = new PanSession(originEvent, {
      onSessionStart,
      onStart,
      onMove,
      onSessionEnd
    }, { transformPagePoint: this.visualElement.getTransformPagePoint() });
  }
  stop(event, info) {
    const isDragging = this.isDragging;
    this.cancel();
    if (!isDragging)
      return;
    const { velocity } = info;
    this.startAnimation(velocity);
    const { onDragEnd } = this.getProps();
    onDragEnd == null ? void 0 : onDragEnd(event, info);
  }
  cancel() {
    var _a, _b;
    this.isDragging = false;
    if (this.visualElement.projection) {
      this.visualElement.projection.isAnimationBlocked = false;
    }
    (_a = this.panSession) == null ? void 0 : _a.end();
    this.panSession = void 0;
    const { dragPropagation } = this.getProps();
    if (!dragPropagation && this.openGlobalLock) {
      this.openGlobalLock();
      this.openGlobalLock = null;
    }
    (_b = this.visualElement.animationState) == null ? void 0 : _b.setActive(AnimationType.Drag, false);
  }
  updateAxis(axis, _point, offset) {
    const { drag } = this.getProps();
    if (!offset || !shouldDrag(axis, drag, this.currentDirection))
      return;
    const axisValue = this.getAxisMotionValue(axis);
    let next = this.originPoint[axis] + offset[axis];
    if (this.constraints && this.constraints[axis]) {
      next = applyConstraints(next, this.constraints[axis], this.elastic[axis]);
    }
    axisValue.set(next);
  }
  resolveConstraints() {
    const { dragConstraints, dragElastic } = this.getProps();
    const { layout } = this.visualElement.projection || {};
    const prevConstraints = this.constraints;
    if (dragConstraints && isRefObject(dragConstraints)) {
      if (!this.constraints) {
        this.constraints = this.resolveRefConstraints();
      }
    } else {
      if (dragConstraints && layout) {
        this.constraints = calcRelativeConstraints(layout.actual, dragConstraints);
      } else {
        this.constraints = false;
      }
    }
    this.elastic = resolveDragElastic(dragElastic);
    if (prevConstraints !== this.constraints && layout && this.constraints && !this.hasMutatedConstraints) {
      eachAxis((axis) => {
        if (this.getAxisMotionValue(axis)) {
          this.constraints[axis] = rebaseAxisConstraints(layout.actual[axis], this.constraints[axis]);
        }
      });
    }
  }
  resolveRefConstraints() {
    const { dragConstraints: constraints, onMeasureDragConstraints } = this.getProps();
    if (!constraints || !isRefObject(constraints))
      return false;
    const constraintsElement = constraints.current;
    invariant(constraintsElement !== null, "If `dragConstraints` is set as a React ref, that ref must be passed to another component's `ref` prop.");
    const { projection } = this.visualElement;
    if (!projection || !projection.layout)
      return false;
    const constraintsBox = measurePageBox(constraintsElement, projection.root, this.visualElement.getTransformPagePoint());
    let measuredConstraints = calcViewportConstraints(projection.layout.actual, constraintsBox);
    if (onMeasureDragConstraints) {
      const userConstraints = onMeasureDragConstraints(convertBoxToBoundingBox(measuredConstraints));
      this.hasMutatedConstraints = !!userConstraints;
      if (userConstraints) {
        measuredConstraints = convertBoundingBoxToBox(userConstraints);
      }
    }
    return measuredConstraints;
  }
  startAnimation(velocity) {
    const {
      drag,
      dragMomentum,
      dragElastic,
      dragTransition,
      dragSnapToOrigin,
      onDragTransitionEnd
    } = this.getProps();
    const constraints = this.constraints || {};
    const momentumAnimations = eachAxis((axis) => {
      var _a;
      if (!shouldDrag(axis, drag, this.currentDirection)) {
        return;
      }
      let transition = (_a = constraints == null ? void 0 : constraints[axis]) != null ? _a : {};
      if (dragSnapToOrigin)
        transition = { min: 0, max: 0 };
      const bounceStiffness = dragElastic ? 200 : 1e6;
      const bounceDamping = dragElastic ? 40 : 1e7;
      const inertia2 = __spreadValues(__spreadValues({
        type: "inertia",
        velocity: dragMomentum ? velocity[axis] : 0,
        bounceStiffness,
        bounceDamping,
        timeConstant: 750,
        restDelta: 1,
        restSpeed: 10
      }, dragTransition), transition);
      return this.startAxisValueAnimation(axis, inertia2);
    });
    return Promise.all(momentumAnimations).then(onDragTransitionEnd);
  }
  startAxisValueAnimation(axis, transition) {
    const axisValue = this.getAxisMotionValue(axis);
    return startAnimation(axis, axisValue, 0, transition);
  }
  stopAnimation() {
    eachAxis((axis) => this.getAxisMotionValue(axis).stop());
  }
  getAxisMotionValue(axis) {
    var _a, _b;
    const dragKey = "_drag" + axis.toUpperCase();
    const externalMotionValue = this.visualElement.getProps()[dragKey];
    return externalMotionValue ? externalMotionValue : this.visualElement.getValue(axis, (_b = (_a = this.visualElement.getProps().initial) == null ? void 0 : _a[axis]) != null ? _b : 0);
  }
  snapToCursor(point) {
    eachAxis((axis) => {
      const { drag } = this.getProps();
      if (!shouldDrag(axis, drag, this.currentDirection))
        return;
      const { projection } = this.visualElement;
      const axisValue = this.getAxisMotionValue(axis);
      if (projection && projection.layout) {
        const { min, max } = projection.layout.actual[axis];
        axisValue.set(point[axis] - mix(min, max, 0.5));
      }
    });
  }
  scalePositionWithinConstraints() {
    var _a;
    const { drag, dragConstraints } = this.getProps();
    const { projection } = this.visualElement;
    if (!isRefObject(dragConstraints) || !projection || !this.constraints)
      return;
    this.stopAnimation();
    const boxProgress = { x: 0, y: 0 };
    eachAxis((axis) => {
      const axisValue = this.getAxisMotionValue(axis);
      if (axisValue) {
        const latest = axisValue.get();
        boxProgress[axis] = calcOrigin$1({ min: latest, max: latest }, this.constraints[axis]);
      }
    });
    const { transformTemplate } = this.visualElement.getProps();
    this.visualElement.getInstance().style.transform = transformTemplate ? transformTemplate({}, "") : "none";
    (_a = projection.root) == null ? void 0 : _a.updateScroll();
    projection.updateLayout();
    this.resolveConstraints();
    eachAxis((axis) => {
      if (!shouldDrag(axis, drag, null))
        return;
      const axisValue = this.getAxisMotionValue(axis);
      const { min, max } = this.constraints[axis];
      axisValue.set(mix(min, max, boxProgress[axis]));
    });
  }
  addListeners() {
    var _a;
    elementDragControls.set(this.visualElement, this);
    const element = this.visualElement.getInstance();
    const stopPointerListener = addPointerEvent(element, "pointerdown", (event) => {
      const { drag, dragListener = true } = this.getProps();
      drag && dragListener && this.start(event);
    });
    const measureDragConstraints = () => {
      const { dragConstraints } = this.getProps();
      if (isRefObject(dragConstraints)) {
        this.constraints = this.resolveRefConstraints();
      }
    };
    const { projection } = this.visualElement;
    const stopMeasureLayoutListener = projection.addEventListener("measure", measureDragConstraints);
    if (projection && !projection.layout) {
      (_a = projection.root) == null ? void 0 : _a.updateScroll();
      projection.updateLayout();
    }
    measureDragConstraints();
    const stopResizeListener = addDomEvent(window, "resize", () => {
      this.scalePositionWithinConstraints();
    });
    projection.addEventListener("didUpdate", ({
      delta,
      hasLayoutChanged
    }) => {
      if (this.isDragging && hasLayoutChanged) {
        eachAxis((axis) => {
          const motionValue2 = this.getAxisMotionValue(axis);
          if (!motionValue2)
            return;
          this.originPoint[axis] += delta[axis].translate;
          motionValue2.set(motionValue2.get() + delta[axis].translate);
        });
        this.visualElement.syncRender();
      }
    });
    return () => {
      stopResizeListener();
      stopPointerListener();
      stopMeasureLayoutListener();
    };
  }
  getProps() {
    const props = this.visualElement.getProps();
    const {
      drag = false,
      dragDirectionLock = false,
      dragPropagation = false,
      dragConstraints = false,
      dragElastic = defaultElastic,
      dragMomentum = true
    } = props;
    return __spreadProps(__spreadValues({}, props), {
      drag,
      dragDirectionLock,
      dragPropagation,
      dragConstraints,
      dragElastic,
      dragMomentum
    });
  }
}
function shouldDrag(direction, drag, currentDirection) {
  return (drag === true || drag === direction) && (currentDirection === null || currentDirection === direction);
}
function getCurrentDirection(offset, lockThreshold = 10) {
  let direction = null;
  if (Math.abs(offset.y) > lockThreshold) {
    direction = "y";
  } else if (Math.abs(offset.x) > lockThreshold) {
    direction = "x";
  }
  return direction;
}
const isMotionValue = (value) => {
  return Boolean(value !== null && typeof value === "object" && value.getVelocity);
};
function animate(from, to, transition = {}) {
  const value = isMotionValue(from) ? from : motionValue$1(from);
  startAnimation("", value, to, transition);
  return {
    stop: () => value.stop(),
    isAnimating: () => value.isAnimating()
  };
}
const borders = ["TopLeft", "TopRight", "BottomLeft", "BottomRight"];
const numBorders = borders.length;
const asNumber = (value) => typeof value === "string" ? parseFloat(value) : value;
const isPx = (value) => typeof value === "number" || px.test(value);
function mixValues(target, follow, lead, progress2, shouldCrossfadeOpacity, isOnlyMember) {
  var _a, _b, _c, _d;
  if (shouldCrossfadeOpacity) {
    target.opacity = mix(0, (_a = lead.opacity) != null ? _a : 1, easeCrossfadeIn(progress2));
    target.opacityExit = mix((_b = follow.opacity) != null ? _b : 1, 0, easeCrossfadeOut(progress2));
  } else if (isOnlyMember) {
    target.opacity = mix((_c = follow.opacity) != null ? _c : 1, (_d = lead.opacity) != null ? _d : 1, progress2);
  }
  for (let i = 0; i < numBorders; i++) {
    const borderLabel = `border${borders[i]}Radius`;
    let followRadius = getRadius(follow, borderLabel);
    let leadRadius = getRadius(lead, borderLabel);
    if (followRadius === void 0 && leadRadius === void 0)
      continue;
    followRadius || (followRadius = 0);
    leadRadius || (leadRadius = 0);
    const canMix = followRadius === 0 || leadRadius === 0 || isPx(followRadius) === isPx(leadRadius);
    if (canMix) {
      target[borderLabel] = Math.max(mix(asNumber(followRadius), asNumber(leadRadius), progress2), 0);
      if (percent.test(leadRadius) || percent.test(followRadius)) {
        target[borderLabel] += "%";
      }
    } else {
      target[borderLabel] = leadRadius;
    }
  }
  if (follow.rotate || lead.rotate) {
    target.rotate = mix(follow.rotate || 0, lead.rotate || 0, progress2);
  }
}
function getRadius(values, radiusName) {
  var _a;
  return (_a = values[radiusName]) != null ? _a : values.borderRadius;
}
const easeCrossfadeIn = compress(0, 0.5, circOut);
const easeCrossfadeOut = compress(0.5, 0.95, linear);
function compress(min, max, easing) {
  return (p2) => {
    if (p2 < min)
      return 0;
    if (p2 > max)
      return 1;
    return easing(progress(min, max, p2));
  };
}
function copyAxisInto(axis, originAxis) {
  axis.min = originAxis.min;
  axis.max = originAxis.max;
}
function copyBoxInto(box, originBox) {
  copyAxisInto(box.x, originBox.x);
  copyAxisInto(box.y, originBox.y);
}
function removePointDelta(point, translate, scale2, originPoint, boxScale) {
  point -= translate;
  point = scalePoint(point, 1 / scale2, originPoint);
  if (boxScale !== void 0) {
    point = scalePoint(point, 1 / boxScale, originPoint);
  }
  return point;
}
function removeAxisDelta(axis, translate = 0, scale2 = 1, origin = 0.5, boxScale, originAxis = axis, sourceAxis = axis) {
  if (percent.test(translate)) {
    translate = parseFloat(translate);
    const relativeProgress = mix(sourceAxis.min, sourceAxis.max, translate / 100);
    translate = relativeProgress - sourceAxis.min;
  }
  if (typeof translate !== "number")
    return;
  let originPoint = mix(originAxis.min, originAxis.max, origin);
  if (axis === originAxis)
    originPoint -= translate;
  axis.min = removePointDelta(axis.min, translate, scale2, originPoint, boxScale);
  axis.max = removePointDelta(axis.max, translate, scale2, originPoint, boxScale);
}
function removeAxisTransforms(axis, transforms, [key, scaleKey, originKey], origin, sourceAxis) {
  removeAxisDelta(axis, transforms[key], transforms[scaleKey], transforms[originKey], transforms.scale, origin, sourceAxis);
}
const xKeys = ["x", "scaleX", "originX"];
const yKeys = ["y", "scaleY", "originY"];
function removeBoxTransforms(box, transforms, originBox, sourceBox) {
  removeAxisTransforms(box.x, transforms, xKeys, originBox == null ? void 0 : originBox.x, sourceBox == null ? void 0 : sourceBox.x);
  removeAxisTransforms(box.y, transforms, yKeys, originBox == null ? void 0 : originBox.y, sourceBox == null ? void 0 : sourceBox.y);
}
function isAxisDeltaZero(delta) {
  return delta.translate === 0 && delta.scale === 1;
}
function isDeltaZero(delta) {
  return isAxisDeltaZero(delta.x) && isAxisDeltaZero(delta.y);
}
function boxEquals(a, b) {
  return a.x.min === b.x.min && a.x.max === b.x.max && a.y.min === b.y.min && a.y.max === b.y.max;
}
class NodeStack {
  constructor() {
    this.members = [];
  }
  add(node) {
    addUniqueItem(this.members, node);
    node.scheduleRender();
  }
  remove(node) {
    removeItem(this.members, node);
    if (node === this.prevLead) {
      this.prevLead = void 0;
    }
    if (node === this.lead) {
      const prevLead = this.members[this.members.length - 1];
      if (prevLead) {
        this.promote(prevLead);
      }
    }
  }
  relegate(node) {
    const indexOfNode = this.members.findIndex((member) => node === member);
    if (indexOfNode === 0)
      return false;
    let prevLead;
    for (let i = indexOfNode; i >= 0; i--) {
      const member = this.members[i];
      if (member.isPresent !== false) {
        prevLead = member;
        break;
      }
    }
    if (prevLead) {
      this.promote(prevLead);
      return true;
    } else {
      return false;
    }
  }
  promote(node, preserveFollowOpacity) {
    var _a;
    const prevLead = this.lead;
    if (node === prevLead)
      return;
    this.prevLead = prevLead;
    this.lead = node;
    node.show();
    if (prevLead) {
      prevLead.instance && prevLead.scheduleRender();
      node.scheduleRender();
      node.resumeFrom = prevLead;
      if (preserveFollowOpacity) {
        node.resumeFrom.preserveOpacity = true;
      }
      if (prevLead.snapshot) {
        node.snapshot = prevLead.snapshot;
        node.snapshot.latestValues = prevLead.animationValues || prevLead.latestValues;
        node.snapshot.isShared = true;
      }
      if ((_a = node.root) == null ? void 0 : _a.isUpdating) {
        node.isLayoutDirty = true;
      }
      const { crossfade } = node.options;
      if (crossfade === false) {
        prevLead.hide();
      }
    }
  }
  exitAnimationComplete() {
    this.members.forEach((node) => {
      var _a, _b, _c, _d, _e;
      (_b = (_a = node.options).onExitComplete) == null ? void 0 : _b.call(_a);
      (_e = (_c = node.resumingFrom) == null ? void 0 : (_d = _c.options).onExitComplete) == null ? void 0 : _e.call(_d);
    });
  }
  scheduleRender() {
    this.members.forEach((node) => {
      node.instance && node.scheduleRender(false);
    });
  }
  removeLeadSnapshot() {
    if (this.lead && this.lead.snapshot) {
      this.lead.snapshot = void 0;
    }
  }
}
const scaleCorrectors = {};
function addScaleCorrector(correctors) {
  Object.assign(scaleCorrectors, correctors);
}
const identityProjection = "translate3d(0px, 0px, 0) scale(1, 1)";
function buildProjectionTransform(delta, treeScale, latestTransform) {
  const xTranslate = delta.x.translate / treeScale.x;
  const yTranslate = delta.y.translate / treeScale.y;
  let transform2 = `translate3d(${xTranslate}px, ${yTranslate}px, 0) `;
  if (latestTransform) {
    const { rotate, rotateX, rotateY } = latestTransform;
    if (rotate)
      transform2 += `rotate(${rotate}deg) `;
    if (rotateX)
      transform2 += `rotateX(${rotateX}deg) `;
    if (rotateY)
      transform2 += `rotateY(${rotateY}deg) `;
  }
  transform2 += `scale(${delta.x.scale}, ${delta.y.scale})`;
  return transform2 === identityProjection ? "none" : transform2;
}
const compareByDepth = (a, b) => a.depth - b.depth;
class FlatTree {
  constructor() {
    this.children = [];
    this.isDirty = false;
  }
  add(child) {
    addUniqueItem(this.children, child);
    this.isDirty = true;
  }
  remove(child) {
    removeItem(this.children, child);
    this.isDirty = true;
  }
  forEach(callback) {
    this.isDirty && this.children.sort(compareByDepth);
    this.isDirty = false;
    this.children.forEach(callback);
  }
}
function resolveMotionValue(value) {
  const unwrappedValue = isMotionValue(value) ? value.get() : value;
  return isCustomValue(unwrappedValue) ? unwrappedValue.toValue() : unwrappedValue;
}
const animationTarget = 1e3;
const globalProjectionState = {
  hasAnimatedSinceResize: true,
  hasEverUpdated: false
};
function createProjectionNode({
  attachResizeListener,
  defaultParent,
  measureScroll,
  resetTransform
}) {
  return class ProjectionNode {
    constructor(id, latestValues = {}, parent = defaultParent == null ? void 0 : defaultParent()) {
      this.children = /* @__PURE__ */ new Set();
      this.options = {};
      this.isTreeAnimating = false;
      this.isAnimationBlocked = false;
      this.isLayoutDirty = false;
      this.updateManuallyBlocked = false;
      this.updateBlockedByResize = false;
      this.isUpdating = false;
      this.isSVG = false;
      this.needsReset = false;
      this.shouldResetTransform = false;
      this.treeScale = { x: 1, y: 1 };
      this.eventHandlers = /* @__PURE__ */ new Map();
      this.potentialNodes = /* @__PURE__ */ new Map();
      this.checkUpdateFailed = () => {
        if (this.isUpdating) {
          this.isUpdating = false;
          this.clearAllSnapshots();
        }
      };
      this.updateProjection = () => {
        this.nodes.forEach(resolveTargetDelta);
        this.nodes.forEach(calcProjection);
      };
      this.hasProjected = false;
      this.isVisible = true;
      this.animationProgress = 0;
      this.sharedNodes = /* @__PURE__ */ new Map();
      this.id = id;
      this.latestValues = latestValues;
      this.root = parent ? parent.root || parent : this;
      this.path = parent ? [...parent.path, parent] : [];
      this.parent = parent;
      this.depth = parent ? parent.depth + 1 : 0;
      id && this.root.registerPotentialNode(id, this);
      for (let i = 0; i < this.path.length; i++) {
        this.path[i].shouldResetTransform = true;
      }
      if (this.root === this)
        this.nodes = new FlatTree();
    }
    addEventListener(name, handler) {
      if (!this.eventHandlers.has(name)) {
        this.eventHandlers.set(name, new SubscriptionManager());
      }
      return this.eventHandlers.get(name).add(handler);
    }
    notifyListeners(name, ...args) {
      const subscriptionManager = this.eventHandlers.get(name);
      subscriptionManager == null ? void 0 : subscriptionManager.notify(...args);
    }
    hasListeners(name) {
      return this.eventHandlers.has(name);
    }
    registerPotentialNode(id, node) {
      this.potentialNodes.set(id, node);
    }
    mount(instance, isLayoutDirty = false) {
      var _a;
      if (this.instance)
        return;
      this.isSVG = instance instanceof SVGElement && instance.tagName !== "svg";
      this.instance = instance;
      const { layoutId, layout, visualElement: visualElement2 } = this.options;
      if (visualElement2 && !visualElement2.getInstance()) {
        visualElement2.mount(instance);
      }
      this.root.nodes.add(this);
      (_a = this.parent) == null ? void 0 : _a.children.add(this);
      this.id && this.root.potentialNodes.delete(this.id);
      if (isLayoutDirty && (layout || layoutId)) {
        this.isLayoutDirty = true;
      }
      if (attachResizeListener) {
        let unblockTimeout;
        const resizeUnblockUpdate = () => this.root.updateBlockedByResize = false;
        attachResizeListener(instance, () => {
          this.root.updateBlockedByResize = true;
          clearTimeout(unblockTimeout);
          unblockTimeout = window.setTimeout(resizeUnblockUpdate, 250);
          if (globalProjectionState.hasAnimatedSinceResize) {
            globalProjectionState.hasAnimatedSinceResize = false;
            this.nodes.forEach(finishAnimation);
          }
        });
      }
      if (layoutId) {
        this.root.registerSharedNode(layoutId, this);
      }
      if (this.options.animate !== false && visualElement2 && (layoutId || layout)) {
        this.addEventListener("didUpdate", ({
          delta,
          hasLayoutChanged,
          hasRelativeTargetChanged,
          layout: newLayout
        }) => {
          var _a2, _b, _c, _d, _e;
          if (this.isTreeAnimationBlocked()) {
            this.target = void 0;
            this.relativeTarget = void 0;
            return;
          }
          const layoutTransition = (_b = (_a2 = this.options.transition) != null ? _a2 : visualElement2.getDefaultTransition()) != null ? _b : defaultLayoutTransition;
          const {
            onLayoutAnimationStart,
            onLayoutAnimationComplete
          } = visualElement2.getProps();
          const targetChanged = !this.targetLayout || !boxEquals(this.targetLayout, newLayout) || hasRelativeTargetChanged;
          const hasOnlyRelativeTargetChanged = !hasLayoutChanged && hasRelativeTargetChanged;
          if (((_c = this.resumeFrom) == null ? void 0 : _c.instance) || hasOnlyRelativeTargetChanged || hasLayoutChanged && (targetChanged || !this.currentAnimation)) {
            if (this.resumeFrom) {
              this.resumingFrom = this.resumeFrom;
              this.resumingFrom.resumingFrom = void 0;
            }
            this.setAnimationOrigin(delta, hasOnlyRelativeTargetChanged);
            const animationOptions = __spreadProps(__spreadValues({}, getValueTransition(layoutTransition, "layout")), {
              onPlay: onLayoutAnimationStart,
              onComplete: onLayoutAnimationComplete
            });
            if (visualElement2.shouldReduceMotion) {
              animationOptions.delay = 0;
              animationOptions.type = false;
            }
            this.startAnimation(animationOptions);
          } else {
            if (!hasLayoutChanged && this.animationProgress === 0) {
              this.finishAnimation();
            }
            this.isLead() && ((_e = (_d = this.options).onExitComplete) == null ? void 0 : _e.call(_d));
          }
          this.targetLayout = newLayout;
        });
      }
    }
    unmount() {
      var _a, _b;
      this.options.layoutId && this.willUpdate();
      this.root.nodes.remove(this);
      (_a = this.getStack()) == null ? void 0 : _a.remove(this);
      (_b = this.parent) == null ? void 0 : _b.children.delete(this);
      this.instance = void 0;
      cancelSync.preRender(this.updateProjection);
    }
    blockUpdate() {
      this.updateManuallyBlocked = true;
    }
    unblockUpdate() {
      this.updateManuallyBlocked = false;
    }
    isUpdateBlocked() {
      return this.updateManuallyBlocked || this.updateBlockedByResize;
    }
    isTreeAnimationBlocked() {
      var _a;
      return this.isAnimationBlocked || ((_a = this.parent) == null ? void 0 : _a.isTreeAnimationBlocked()) || false;
    }
    startUpdate() {
      var _a;
      if (this.isUpdateBlocked())
        return;
      this.isUpdating = true;
      (_a = this.nodes) == null ? void 0 : _a.forEach(resetRotation);
    }
    willUpdate(shouldNotifyListeners = true) {
      var _a, _b, _c;
      if (this.root.isUpdateBlocked()) {
        (_b = (_a = this.options).onExitComplete) == null ? void 0 : _b.call(_a);
        return;
      }
      !this.root.isUpdating && this.root.startUpdate();
      if (this.isLayoutDirty)
        return;
      this.isLayoutDirty = true;
      for (let i = 0; i < this.path.length; i++) {
        const node = this.path[i];
        node.shouldResetTransform = true;
        node.updateScroll();
      }
      const { layoutId, layout } = this.options;
      if (layoutId === void 0 && !layout)
        return;
      const transformTemplate = (_c = this.options.visualElement) == null ? void 0 : _c.getProps().transformTemplate;
      this.prevTransformTemplateValue = transformTemplate == null ? void 0 : transformTemplate(this.latestValues, "");
      this.updateSnapshot();
      shouldNotifyListeners && this.notifyListeners("willUpdate");
    }
    didUpdate() {
      const updateWasBlocked = this.isUpdateBlocked();
      if (updateWasBlocked) {
        this.unblockUpdate();
        this.clearAllSnapshots();
        this.nodes.forEach(clearMeasurements);
        return;
      }
      if (!this.isUpdating)
        return;
      this.isUpdating = false;
      if (this.potentialNodes.size) {
        this.potentialNodes.forEach(mountNodeEarly);
        this.potentialNodes.clear();
      }
      this.nodes.forEach(resetTransformStyle);
      this.nodes.forEach(updateLayout);
      this.nodes.forEach(notifyLayoutUpdate);
      this.clearAllSnapshots();
      flushSync.update();
      flushSync.preRender();
      flushSync.render();
    }
    clearAllSnapshots() {
      this.nodes.forEach(clearSnapshot);
      this.sharedNodes.forEach(removeLeadSnapshots);
    }
    scheduleUpdateProjection() {
      sync.preRender(this.updateProjection, false, true);
    }
    scheduleCheckAfterUnmount() {
      sync.postRender(() => {
        if (this.isLayoutDirty) {
          this.root.didUpdate();
        } else {
          this.root.checkUpdateFailed();
        }
      });
    }
    updateSnapshot() {
      if (this.snapshot || !this.instance)
        return;
      const measured = this.measure();
      const layout = this.removeTransform(this.removeElementScroll(measured));
      roundBox(layout);
      this.snapshot = {
        measured,
        layout,
        latestValues: {}
      };
    }
    updateLayout() {
      var _a;
      if (!this.instance)
        return;
      this.updateScroll();
      if (!(this.options.alwaysMeasureLayout && this.isLead()) && !this.isLayoutDirty) {
        return;
      }
      if (this.resumeFrom && !this.resumeFrom.instance) {
        for (let i = 0; i < this.path.length; i++) {
          const node = this.path[i];
          node.updateScroll();
        }
      }
      const measured = this.measure();
      roundBox(measured);
      const prevLayout = this.layout;
      this.layout = {
        measured,
        actual: this.removeElementScroll(measured)
      };
      this.layoutCorrected = createBox();
      this.isLayoutDirty = false;
      this.projectionDelta = void 0;
      this.notifyListeners("measure", this.layout.actual);
      (_a = this.options.visualElement) == null ? void 0 : _a.notifyLayoutMeasure(this.layout.actual, prevLayout == null ? void 0 : prevLayout.actual);
    }
    updateScroll() {
      if (this.options.layoutScroll && this.instance) {
        this.scroll = measureScroll(this.instance);
      }
    }
    resetTransform() {
      var _a;
      if (!resetTransform)
        return;
      const isResetRequested = this.isLayoutDirty || this.shouldResetTransform;
      const hasProjection = this.projectionDelta && !isDeltaZero(this.projectionDelta);
      const transformTemplate = (_a = this.options.visualElement) == null ? void 0 : _a.getProps().transformTemplate;
      const transformTemplateValue = transformTemplate == null ? void 0 : transformTemplate(this.latestValues, "");
      const transformTemplateHasChanged = transformTemplateValue !== this.prevTransformTemplateValue;
      if (isResetRequested && (hasProjection || hasTransform(this.latestValues) || transformTemplateHasChanged)) {
        resetTransform(this.instance, transformTemplateValue);
        this.shouldResetTransform = false;
        this.scheduleRender();
      }
    }
    measure() {
      const { visualElement: visualElement2 } = this.options;
      if (!visualElement2)
        return createBox();
      const box = visualElement2.measureViewportBox();
      const { scroll } = this.root;
      if (scroll) {
        translateAxis(box.x, scroll.x);
        translateAxis(box.y, scroll.y);
      }
      return box;
    }
    removeElementScroll(box) {
      const boxWithoutScroll = createBox();
      copyBoxInto(boxWithoutScroll, box);
      for (let i = 0; i < this.path.length; i++) {
        const node = this.path[i];
        const { scroll, options } = node;
        if (node !== this.root && scroll && options.layoutScroll) {
          translateAxis(boxWithoutScroll.x, scroll.x);
          translateAxis(boxWithoutScroll.y, scroll.y);
        }
      }
      return boxWithoutScroll;
    }
    applyTransform(box, transformOnly = false) {
      const withTransforms = createBox();
      copyBoxInto(withTransforms, box);
      for (let i = 0; i < this.path.length; i++) {
        const node = this.path[i];
        if (!transformOnly && node.options.layoutScroll && node.scroll && node !== node.root) {
          transformBox(withTransforms, {
            x: -node.scroll.x,
            y: -node.scroll.y
          });
        }
        if (!hasTransform(node.latestValues))
          continue;
        transformBox(withTransforms, node.latestValues);
      }
      if (hasTransform(this.latestValues)) {
        transformBox(withTransforms, this.latestValues);
      }
      return withTransforms;
    }
    removeTransform(box) {
      var _a;
      const boxWithoutTransform = createBox();
      copyBoxInto(boxWithoutTransform, box);
      for (let i = 0; i < this.path.length; i++) {
        const node = this.path[i];
        if (!node.instance)
          continue;
        if (!hasTransform(node.latestValues))
          continue;
        hasScale(node.latestValues) && node.updateSnapshot();
        const sourceBox = createBox();
        const nodeBox = node.measure();
        copyBoxInto(sourceBox, nodeBox);
        removeBoxTransforms(boxWithoutTransform, node.latestValues, (_a = node.snapshot) == null ? void 0 : _a.layout, sourceBox);
      }
      if (hasTransform(this.latestValues)) {
        removeBoxTransforms(boxWithoutTransform, this.latestValues);
      }
      return boxWithoutTransform;
    }
    setTargetDelta(delta) {
      this.targetDelta = delta;
      this.root.scheduleUpdateProjection();
    }
    setOptions(options) {
      var _a;
      this.options = __spreadProps(__spreadValues(__spreadValues({}, this.options), options), {
        crossfade: (_a = options.crossfade) != null ? _a : true
      });
    }
    clearMeasurements() {
      this.scroll = void 0;
      this.layout = void 0;
      this.snapshot = void 0;
      this.prevTransformTemplateValue = void 0;
      this.targetDelta = void 0;
      this.target = void 0;
      this.isLayoutDirty = false;
    }
    resolveTargetDelta() {
      var _a;
      const { layout, layoutId } = this.options;
      if (!this.layout || !(layout || layoutId))
        return;
      if (!this.targetDelta && !this.relativeTarget) {
        this.relativeParent = this.getClosestProjectingParent();
        if (this.relativeParent && this.relativeParent.layout) {
          this.relativeTarget = createBox();
          this.relativeTargetOrigin = createBox();
          calcRelativePosition(this.relativeTargetOrigin, this.layout.actual, this.relativeParent.layout.actual);
          copyBoxInto(this.relativeTarget, this.relativeTargetOrigin);
        }
      }
      if (!this.relativeTarget && !this.targetDelta)
        return;
      if (!this.target) {
        this.target = createBox();
        this.targetWithTransforms = createBox();
      }
      if (this.relativeTarget && this.relativeTargetOrigin && ((_a = this.relativeParent) == null ? void 0 : _a.target)) {
        calcRelativeBox(this.target, this.relativeTarget, this.relativeParent.target);
      } else if (this.targetDelta) {
        if (Boolean(this.resumingFrom)) {
          this.target = this.applyTransform(this.layout.actual);
        } else {
          copyBoxInto(this.target, this.layout.actual);
        }
        applyBoxDelta(this.target, this.targetDelta);
      } else {
        copyBoxInto(this.target, this.layout.actual);
      }
      if (this.attemptToResolveRelativeTarget) {
        this.attemptToResolveRelativeTarget = false;
        this.relativeParent = this.getClosestProjectingParent();
        if (this.relativeParent && Boolean(this.relativeParent.resumingFrom) === Boolean(this.resumingFrom) && !this.relativeParent.options.layoutScroll && this.relativeParent.target) {
          this.relativeTarget = createBox();
          this.relativeTargetOrigin = createBox();
          calcRelativePosition(this.relativeTargetOrigin, this.target, this.relativeParent.target);
          copyBoxInto(this.relativeTarget, this.relativeTargetOrigin);
        }
      }
    }
    getClosestProjectingParent() {
      if (!this.parent || hasTransform(this.parent.latestValues))
        return void 0;
      if ((this.parent.relativeTarget || this.parent.targetDelta) && this.parent.layout) {
        return this.parent;
      } else {
        return this.parent.getClosestProjectingParent();
      }
    }
    calcProjection() {
      var _a;
      const { layout, layoutId } = this.options;
      this.isTreeAnimating = Boolean(((_a = this.parent) == null ? void 0 : _a.isTreeAnimating) || this.currentAnimation || this.pendingAnimation);
      if (!this.isTreeAnimating) {
        this.targetDelta = this.relativeTarget = void 0;
      }
      if (!this.layout || !(layout || layoutId))
        return;
      const lead = this.getLead();
      copyBoxInto(this.layoutCorrected, this.layout.actual);
      applyTreeDeltas(this.layoutCorrected, this.treeScale, this.path, Boolean(this.resumingFrom) || this !== lead);
      const { target } = lead;
      if (!target)
        return;
      if (!this.projectionDelta) {
        this.projectionDelta = createDelta();
        this.projectionDeltaWithTransform = createDelta();
      }
      const prevTreeScaleX = this.treeScale.x;
      const prevTreeScaleY = this.treeScale.y;
      const prevProjectionTransform = this.projectionTransform;
      calcBoxDelta(this.projectionDelta, this.layoutCorrected, target, this.latestValues);
      this.projectionTransform = buildProjectionTransform(this.projectionDelta, this.treeScale);
      if (this.projectionTransform !== prevProjectionTransform || this.treeScale.x !== prevTreeScaleX || this.treeScale.y !== prevTreeScaleY) {
        this.hasProjected = true;
        this.scheduleRender();
        this.notifyListeners("projectionUpdate", target);
      }
    }
    hide() {
      this.isVisible = false;
    }
    show() {
      this.isVisible = true;
    }
    scheduleRender(notifyAll = true) {
      var _a, _b, _c;
      (_b = (_a = this.options).scheduleRender) == null ? void 0 : _b.call(_a);
      notifyAll && ((_c = this.getStack()) == null ? void 0 : _c.scheduleRender());
      if (this.resumingFrom && !this.resumingFrom.instance) {
        this.resumingFrom = void 0;
      }
    }
    setAnimationOrigin(delta, hasOnlyRelativeTargetChanged = false) {
      var _a;
      const snapshot = this.snapshot;
      const snapshotLatestValues = (snapshot == null ? void 0 : snapshot.latestValues) || {};
      const mixedValues = __spreadValues({}, this.latestValues);
      const targetDelta = createDelta();
      this.relativeTarget = this.relativeTargetOrigin = void 0;
      this.attemptToResolveRelativeTarget = !hasOnlyRelativeTargetChanged;
      const relativeLayout = createBox();
      const isSharedLayoutAnimation = snapshot == null ? void 0 : snapshot.isShared;
      const isOnlyMember = (((_a = this.getStack()) == null ? void 0 : _a.members.length) || 0) <= 1;
      const shouldCrossfadeOpacity = Boolean(isSharedLayoutAnimation && !isOnlyMember && this.options.crossfade === true && !this.path.some(hasOpacityCrossfade));
      this.animationProgress = 0;
      this.mixTargetDelta = (latest) => {
        var _a2;
        const progress2 = latest / 1e3;
        mixAxisDelta(targetDelta.x, delta.x, progress2);
        mixAxisDelta(targetDelta.y, delta.y, progress2);
        this.setTargetDelta(targetDelta);
        if (this.relativeTarget && this.relativeTargetOrigin && this.layout && ((_a2 = this.relativeParent) == null ? void 0 : _a2.layout)) {
          calcRelativePosition(relativeLayout, this.layout.actual, this.relativeParent.layout.actual);
          mixBox(this.relativeTarget, this.relativeTargetOrigin, relativeLayout, progress2);
        }
        if (isSharedLayoutAnimation) {
          this.animationValues = mixedValues;
          mixValues(mixedValues, snapshotLatestValues, this.latestValues, progress2, shouldCrossfadeOpacity, isOnlyMember);
        }
        this.root.scheduleUpdateProjection();
        this.scheduleRender();
        this.animationProgress = progress2;
      };
      this.mixTargetDelta(0);
    }
    startAnimation(options) {
      var _a, _b;
      this.notifyListeners("animationStart");
      (_a = this.currentAnimation) == null ? void 0 : _a.stop();
      if (this.resumingFrom) {
        (_b = this.resumingFrom.currentAnimation) == null ? void 0 : _b.stop();
      }
      if (this.pendingAnimation) {
        cancelSync.update(this.pendingAnimation);
        this.pendingAnimation = void 0;
      }
      this.pendingAnimation = sync.update(() => {
        globalProjectionState.hasAnimatedSinceResize = true;
        this.currentAnimation = animate(0, animationTarget, __spreadProps(__spreadValues({}, options), {
          onUpdate: (latest) => {
            var _a2;
            this.mixTargetDelta(latest);
            (_a2 = options.onUpdate) == null ? void 0 : _a2.call(options, latest);
          },
          onComplete: () => {
            var _a2;
            (_a2 = options.onComplete) == null ? void 0 : _a2.call(options);
            this.completeAnimation();
          }
        }));
        if (this.resumingFrom) {
          this.resumingFrom.currentAnimation = this.currentAnimation;
        }
        this.pendingAnimation = void 0;
      });
    }
    completeAnimation() {
      var _a;
      if (this.resumingFrom) {
        this.resumingFrom.currentAnimation = void 0;
        this.resumingFrom.preserveOpacity = void 0;
      }
      (_a = this.getStack()) == null ? void 0 : _a.exitAnimationComplete();
      this.resumingFrom = this.currentAnimation = this.animationValues = void 0;
      this.notifyListeners("animationComplete");
    }
    finishAnimation() {
      var _a;
      if (this.currentAnimation) {
        (_a = this.mixTargetDelta) == null ? void 0 : _a.call(this, animationTarget);
        this.currentAnimation.stop();
      }
      this.completeAnimation();
    }
    applyTransformsToTarget() {
      const { targetWithTransforms, target, layout, latestValues } = this.getLead();
      if (!targetWithTransforms || !target || !layout)
        return;
      copyBoxInto(targetWithTransforms, target);
      transformBox(targetWithTransforms, latestValues);
      calcBoxDelta(this.projectionDeltaWithTransform, this.layoutCorrected, targetWithTransforms, latestValues);
    }
    registerSharedNode(layoutId, node) {
      var _a, _b, _c;
      if (!this.sharedNodes.has(layoutId)) {
        this.sharedNodes.set(layoutId, new NodeStack());
      }
      const stack = this.sharedNodes.get(layoutId);
      stack.add(node);
      node.promote({
        transition: (_a = node.options.initialPromotionConfig) == null ? void 0 : _a.transition,
        preserveFollowOpacity: (_c = (_b = node.options.initialPromotionConfig) == null ? void 0 : _b.shouldPreserveFollowOpacity) == null ? void 0 : _c.call(_b, node)
      });
    }
    isLead() {
      const stack = this.getStack();
      return stack ? stack.lead === this : true;
    }
    getLead() {
      var _a;
      const { layoutId } = this.options;
      return layoutId ? ((_a = this.getStack()) == null ? void 0 : _a.lead) || this : this;
    }
    getPrevLead() {
      var _a;
      const { layoutId } = this.options;
      return layoutId ? (_a = this.getStack()) == null ? void 0 : _a.prevLead : void 0;
    }
    getStack() {
      const { layoutId } = this.options;
      if (layoutId)
        return this.root.sharedNodes.get(layoutId);
    }
    promote({
      needsReset,
      transition,
      preserveFollowOpacity
    } = {}) {
      const stack = this.getStack();
      if (stack)
        stack.promote(this, preserveFollowOpacity);
      if (needsReset) {
        this.projectionDelta = void 0;
        this.needsReset = true;
      }
      if (transition)
        this.setOptions({ transition });
    }
    relegate() {
      const stack = this.getStack();
      if (stack) {
        return stack.relegate(this);
      } else {
        return false;
      }
    }
    resetRotation() {
      const { visualElement: visualElement2 } = this.options;
      if (!visualElement2)
        return;
      let hasRotate = false;
      const resetValues = {};
      for (let i = 0; i < transformAxes.length; i++) {
        const axis = transformAxes[i];
        const key = "rotate" + axis;
        if (!visualElement2.getStaticValue(key)) {
          continue;
        }
        hasRotate = true;
        resetValues[key] = visualElement2.getStaticValue(key);
        visualElement2.setStaticValue(key, 0);
      }
      if (!hasRotate)
        return;
      visualElement2 == null ? void 0 : visualElement2.syncRender();
      for (const key in resetValues) {
        visualElement2.setStaticValue(key, resetValues[key]);
      }
      visualElement2.scheduleRender();
    }
    getProjectionStyles(styleProp = {}) {
      var _a, _b, _c, _d, _e, _f;
      const styles = {};
      if (!this.instance || this.isSVG)
        return styles;
      if (!this.isVisible) {
        return { visibility: "hidden" };
      } else {
        styles.visibility = "";
      }
      const transformTemplate = (_a = this.options.visualElement) == null ? void 0 : _a.getProps().transformTemplate;
      if (this.needsReset) {
        this.needsReset = false;
        styles.opacity = "";
        styles.pointerEvents = resolveMotionValue(styleProp.pointerEvents) || "";
        styles.transform = transformTemplate ? transformTemplate(this.latestValues, "") : "none";
        return styles;
      }
      const lead = this.getLead();
      if (!this.projectionDelta || !this.layout || !lead.target) {
        const emptyStyles = {};
        if (this.options.layoutId) {
          emptyStyles.opacity = (_b = this.latestValues.opacity) != null ? _b : 1;
          emptyStyles.pointerEvents = resolveMotionValue(styleProp.pointerEvents) || "";
        }
        if (this.hasProjected && !hasTransform(this.latestValues)) {
          emptyStyles.transform = transformTemplate ? transformTemplate({}, "") : "none";
          this.hasProjected = false;
        }
        return emptyStyles;
      }
      const valuesToRender = lead.animationValues || lead.latestValues;
      this.applyTransformsToTarget();
      styles.transform = buildProjectionTransform(this.projectionDeltaWithTransform, this.treeScale, valuesToRender);
      if (transformTemplate) {
        styles.transform = transformTemplate(valuesToRender, styles.transform);
      }
      const { x: x2, y: y2 } = this.projectionDelta;
      styles.transformOrigin = `${x2.origin * 100}% ${y2.origin * 100}% 0`;
      if (lead.animationValues) {
        styles.opacity = lead === this ? (_d = (_c = valuesToRender.opacity) != null ? _c : this.latestValues.opacity) != null ? _d : 1 : this.preserveOpacity ? this.latestValues.opacity : valuesToRender.opacityExit;
      } else {
        styles.opacity = lead === this ? (_e = valuesToRender.opacity) != null ? _e : "" : (_f = valuesToRender.opacityExit) != null ? _f : 0;
      }
      for (const key in scaleCorrectors) {
        if (valuesToRender[key] === void 0)
          continue;
        const { correct, applyTo } = scaleCorrectors[key];
        const corrected = correct(valuesToRender[key], lead);
        if (applyTo) {
          const num = applyTo.length;
          for (let i = 0; i < num; i++) {
            styles[applyTo[i]] = corrected;
          }
        } else {
          styles[key] = corrected;
        }
      }
      if (this.options.layoutId) {
        styles.pointerEvents = lead === this ? resolveMotionValue(styleProp.pointerEvents) || "" : "none";
      }
      return styles;
    }
    clearSnapshot() {
      this.resumeFrom = this.snapshot = void 0;
    }
    resetTree() {
      this.root.nodes.forEach((node) => {
        var _a;
        return (_a = node.currentAnimation) == null ? void 0 : _a.stop();
      });
      this.root.nodes.forEach(clearMeasurements);
      this.root.sharedNodes.clear();
    }
  };
}
function updateLayout(node) {
  node.updateLayout();
}
function notifyLayoutUpdate(node) {
  var _a, _b, _c, _d;
  const snapshot = (_b = (_a = node.resumeFrom) == null ? void 0 : _a.snapshot) != null ? _b : node.snapshot;
  if (node.isLead() && node.layout && snapshot && node.hasListeners("didUpdate")) {
    const { actual: layout, measured: measuredLayout } = node.layout;
    if (node.options.animationType === "size") {
      eachAxis((axis) => {
        const axisSnapshot = snapshot.isShared ? snapshot.measured[axis] : snapshot.layout[axis];
        const length = calcLength(axisSnapshot);
        axisSnapshot.min = layout[axis].min;
        axisSnapshot.max = axisSnapshot.min + length;
      });
    } else if (node.options.animationType === "position") {
      eachAxis((axis) => {
        const axisSnapshot = snapshot.isShared ? snapshot.measured[axis] : snapshot.layout[axis];
        const length = calcLength(layout[axis]);
        axisSnapshot.max = axisSnapshot.min + length;
      });
    }
    const layoutDelta = createDelta();
    calcBoxDelta(layoutDelta, layout, snapshot.layout);
    const visualDelta = createDelta();
    if (snapshot.isShared) {
      calcBoxDelta(visualDelta, node.applyTransform(measuredLayout, true), snapshot.measured);
    } else {
      calcBoxDelta(visualDelta, layout, snapshot.layout);
    }
    const hasLayoutChanged = !isDeltaZero(layoutDelta);
    let hasRelativeTargetChanged = false;
    if (!node.resumeFrom) {
      node.relativeParent = node.getClosestProjectingParent();
      if (node.relativeParent && !node.relativeParent.resumeFrom) {
        const { snapshot: parentSnapshot, layout: parentLayout } = node.relativeParent;
        if (parentSnapshot && parentLayout) {
          const relativeSnapshot = createBox();
          calcRelativePosition(relativeSnapshot, snapshot.layout, parentSnapshot.layout);
          const relativeLayout = createBox();
          calcRelativePosition(relativeLayout, layout, parentLayout.actual);
          if (!boxEquals(relativeSnapshot, relativeLayout)) {
            hasRelativeTargetChanged = true;
          }
        }
      }
    }
    node.notifyListeners("didUpdate", {
      layout,
      snapshot,
      delta: visualDelta,
      layoutDelta,
      hasLayoutChanged,
      hasRelativeTargetChanged
    });
  } else if (node.isLead()) {
    (_d = (_c = node.options).onExitComplete) == null ? void 0 : _d.call(_c);
  }
  node.options.transition = void 0;
}
function clearSnapshot(node) {
  node.clearSnapshot();
}
function clearMeasurements(node) {
  node.clearMeasurements();
}
function resetTransformStyle(node) {
  const { visualElement: visualElement2 } = node.options;
  if (visualElement2 == null ? void 0 : visualElement2.getProps().onBeforeLayoutMeasure) {
    visualElement2.notifyBeforeLayoutMeasure();
  }
  node.resetTransform();
}
function finishAnimation(node) {
  node.finishAnimation();
  node.targetDelta = node.relativeTarget = node.target = void 0;
}
function resolveTargetDelta(node) {
  node.resolveTargetDelta();
}
function calcProjection(node) {
  node.calcProjection();
}
function resetRotation(node) {
  node.resetRotation();
}
function removeLeadSnapshots(stack) {
  stack.removeLeadSnapshot();
}
function mixAxisDelta(output, delta, p2) {
  output.translate = mix(delta.translate, 0, p2);
  output.scale = mix(delta.scale, 1, p2);
  output.origin = delta.origin;
  output.originPoint = delta.originPoint;
}
function mixAxis(output, from, to, p2) {
  output.min = mix(from.min, to.min, p2);
  output.max = mix(from.max, to.max, p2);
}
function mixBox(output, from, to, p2) {
  mixAxis(output.x, from.x, to.x, p2);
  mixAxis(output.y, from.y, to.y, p2);
}
function hasOpacityCrossfade(node) {
  return node.animationValues && node.animationValues.opacityExit !== void 0;
}
const defaultLayoutTransition = {
  duration: 0.45,
  ease: [0.4, 0, 0.1, 1]
};
function mountNodeEarly(node, id) {
  let searchNode = node.root;
  for (let i = node.path.length - 1; i >= 0; i--) {
    if (Boolean(node.path[i].instance)) {
      searchNode = node.path[i];
      break;
    }
  }
  const searchElement = searchNode && searchNode !== node.root ? searchNode.instance : document;
  const element = searchElement.querySelector(`[data-projection-id="${id}"]`);
  if (element)
    node.mount(element, true);
}
function roundAxis(axis) {
  axis.min = Math.round(axis.min);
  axis.max = Math.round(axis.max);
}
function roundBox(box) {
  roundAxis(box.x);
  roundAxis(box.y);
}
const DocumentProjectionNode = createProjectionNode({
  attachResizeListener: (ref, notify) => {
    ref.addEventListener("resize", notify, { passive: true });
    return () => ref.removeEventListener("resize", notify);
  },
  measureScroll: () => ({
    x: document.documentElement.scrollLeft || document.body.scrollLeft,
    y: document.documentElement.scrollTop || document.body.scrollTop
  })
});
const rootProjectionNode = {
  current: void 0
};
const HTMLProjectionNode = createProjectionNode({
  measureScroll: (instance) => ({
    x: instance.scrollLeft,
    y: instance.scrollTop
  }),
  defaultParent: () => {
    if (!rootProjectionNode.current) {
      const documentNode = new DocumentProjectionNode(0, {});
      documentNode.mount(window);
      documentNode.setOptions({ layoutScroll: true });
      rootProjectionNode.current = documentNode;
    }
    return rootProjectionNode.current;
  },
  resetTransform: (instance, value) => {
    instance.style.transform = value != null ? value : "none";
  }
});
function isAnimationControls(v2) {
  return typeof v2 === "object" && typeof v2.start === "function";
}
function shallowCompare(next, prev) {
  if (!Array.isArray(prev))
    return false;
  const prevLength = prev.length;
  if (prevLength !== next.length)
    return false;
  for (let i = 0; i < prevLength; i++) {
    if (prev[i] !== next[i])
      return false;
  }
  return true;
}
const variantPriorityOrder = [
  AnimationType.Animate,
  AnimationType.InView,
  AnimationType.Focus,
  AnimationType.Hover,
  AnimationType.Tap,
  AnimationType.Drag,
  AnimationType.Exit
];
const reversePriorityOrder = [...variantPriorityOrder].reverse();
const numAnimationTypes = variantPriorityOrder.length;
function animateList(visualElement2) {
  return (animations) => Promise.all(animations.map(({ animation, options }) => animateVisualElement(visualElement2, animation, options)));
}
function createAnimationState(visualElement2) {
  let animate2 = animateList(visualElement2);
  const state = createState();
  let allAnimatedKeys = {};
  let isInitialRender = true;
  const buildResolvedTypeValues = (acc, definition) => {
    const resolved = resolveVariant(visualElement2, definition);
    if (resolved) {
      const _a = resolved, { transition, transitionEnd } = _a, target = __objRest(_a, ["transition", "transitionEnd"]);
      acc = __spreadValues(__spreadValues(__spreadValues({}, acc), target), transitionEnd);
    }
    return acc;
  };
  function isAnimated(key) {
    return allAnimatedKeys[key] !== void 0;
  }
  function setAnimateFunction(makeAnimator) {
    animate2 = makeAnimator(visualElement2);
  }
  function animateChanges(options, changedActiveType) {
    var _a;
    const props = visualElement2.getProps();
    const context = visualElement2.getVariantContext(true) || {};
    const animations = [];
    const removedKeys = /* @__PURE__ */ new Set();
    let encounteredKeys = {};
    let removedVariantIndex = Infinity;
    for (let i = 0; i < numAnimationTypes; i++) {
      const type = reversePriorityOrder[i];
      const typeState = state[type];
      const prop = (_a = props[type]) != null ? _a : context[type];
      const propIsVariant = isVariantLabel(prop);
      const activeDelta = type === changedActiveType ? typeState.isActive : null;
      if (activeDelta === false)
        removedVariantIndex = i;
      let isInherited = prop === context[type] && prop !== props[type] && propIsVariant;
      if (isInherited && isInitialRender && visualElement2.manuallyAnimateOnMount) {
        isInherited = false;
      }
      typeState.protectedKeys = __spreadValues({}, encounteredKeys);
      if (!typeState.isActive && activeDelta === null || !prop && !typeState.prevProp || isAnimationControls(prop) || typeof prop === "boolean") {
        continue;
      }
      const variantDidChange = checkVariantsDidChange(typeState.prevProp, prop);
      let shouldAnimateType = variantDidChange || type === changedActiveType && typeState.isActive && !isInherited && propIsVariant || i > removedVariantIndex && propIsVariant;
      const definitionList = Array.isArray(prop) ? prop : [prop];
      let resolvedValues = definitionList.reduce(buildResolvedTypeValues, {});
      if (activeDelta === false)
        resolvedValues = {};
      const { prevResolvedValues = {} } = typeState;
      const allKeys = __spreadValues(__spreadValues({}, prevResolvedValues), resolvedValues);
      const markToAnimate = (key) => {
        shouldAnimateType = true;
        removedKeys.delete(key);
        typeState.needsAnimating[key] = true;
      };
      for (const key in allKeys) {
        const next = resolvedValues[key];
        const prev = prevResolvedValues[key];
        if (encounteredKeys.hasOwnProperty(key))
          continue;
        if (next !== prev) {
          if (isKeyframesTarget(next) && isKeyframesTarget(prev)) {
            if (!shallowCompare(next, prev) || variantDidChange) {
              markToAnimate(key);
            } else {
              typeState.protectedKeys[key] = true;
            }
          } else if (next !== void 0) {
            markToAnimate(key);
          } else {
            removedKeys.add(key);
          }
        } else if (next !== void 0 && removedKeys.has(key)) {
          markToAnimate(key);
        } else {
          typeState.protectedKeys[key] = true;
        }
      }
      typeState.prevProp = prop;
      typeState.prevResolvedValues = resolvedValues;
      if (typeState.isActive) {
        encounteredKeys = __spreadValues(__spreadValues({}, encounteredKeys), resolvedValues);
      }
      if (isInitialRender && visualElement2.blockInitialAnimation) {
        shouldAnimateType = false;
      }
      if (shouldAnimateType && !isInherited) {
        animations.push(...definitionList.map((animation) => ({
          animation,
          options: __spreadValues({ type }, options)
        })));
      }
    }
    allAnimatedKeys = __spreadValues({}, encounteredKeys);
    if (removedKeys.size) {
      const fallbackAnimation = {};
      removedKeys.forEach((key) => {
        const fallbackTarget = visualElement2.getBaseTarget(key);
        if (fallbackTarget !== void 0) {
          fallbackAnimation[key] = fallbackTarget;
        }
      });
      animations.push({ animation: fallbackAnimation });
    }
    let shouldAnimate = Boolean(animations.length);
    if (isInitialRender && props.initial === false && !visualElement2.manuallyAnimateOnMount) {
      shouldAnimate = false;
    }
    isInitialRender = false;
    return shouldAnimate ? animate2(animations) : Promise.resolve();
  }
  function setActive(type, isActive, options) {
    var _a;
    if (state[type].isActive === isActive)
      return Promise.resolve();
    (_a = visualElement2.variantChildren) == null ? void 0 : _a.forEach((child) => {
      var _a2;
      return (_a2 = child.animationState) == null ? void 0 : _a2.setActive(type, isActive);
    });
    state[type].isActive = isActive;
    const animations = animateChanges(options, type);
    for (const key in state) {
      state[key].protectedKeys = {};
    }
    return animations;
  }
  return {
    isAnimated,
    animateChanges,
    setActive,
    setAnimateFunction,
    getState: () => state
  };
}
function checkVariantsDidChange(prev, next) {
  if (typeof next === "string") {
    return next !== prev;
  } else if (isVariantLabels(next)) {
    return !shallowCompare(next, prev);
  }
  return false;
}
function createTypeState(isActive = false) {
  return {
    isActive,
    protectedKeys: {},
    needsAnimating: {},
    prevResolvedValues: {}
  };
}
function createState() {
  return {
    [AnimationType.Animate]: createTypeState(true),
    [AnimationType.InView]: createTypeState(),
    [AnimationType.Hover]: createTypeState(),
    [AnimationType.Tap]: createTypeState(),
    [AnimationType.Drag]: createTypeState(),
    [AnimationType.Focus]: createTypeState(),
    [AnimationType.Exit]: createTypeState()
  };
}
const names = [
  "LayoutMeasure",
  "BeforeLayoutMeasure",
  "LayoutUpdate",
  "ViewportBoxUpdate",
  "Update",
  "Render",
  "AnimationComplete",
  "LayoutAnimationComplete",
  "AnimationStart",
  "LayoutAnimationStart",
  "SetAxisTarget",
  "Unmount"
];
function createLifecycles() {
  const managers = names.map(() => new SubscriptionManager());
  const propSubscriptions = {};
  const lifecycles = {
    clearAllListeners: () => managers.forEach((manager) => manager.clear()),
    updatePropListeners: (props) => {
      names.forEach((name) => {
        var _a;
        const on = "on" + name;
        const propListener = props[on];
        (_a = propSubscriptions[name]) == null ? void 0 : _a.call(propSubscriptions);
        if (propListener) {
          propSubscriptions[name] = lifecycles[on](propListener);
        }
      });
    }
  };
  managers.forEach((manager, i) => {
    lifecycles["on" + names[i]] = (handler) => manager.add(handler);
    lifecycles["notify" + names[i]] = (...args) => manager.notify(...args);
  });
  return lifecycles;
}
function updateMotionValuesFromProps(element, next, prev) {
  var _a;
  for (const key in next) {
    const nextValue = next[key];
    const prevValue = prev[key];
    if (isMotionValue(nextValue)) {
      element.addValue(key, nextValue);
    } else if (isMotionValue(prevValue)) {
      element.addValue(key, motionValue$1(nextValue));
    } else if (prevValue !== nextValue) {
      if (element.hasValue(key)) {
        const existingValue = element.getValue(key);
        !existingValue.hasAnimated && existingValue.set(nextValue);
      } else {
        element.addValue(key, motionValue$1((_a = element.getStaticValue(key)) != null ? _a : nextValue));
      }
    }
  }
  for (const key in prev) {
    if (next[key] === void 0)
      element.removeValue(key);
  }
  return next;
}
const visualElement = ({
  treeType = "",
  build,
  getBaseTarget,
  makeTargetAnimatable,
  measureViewportBox: measureViewportBox2,
  render: renderInstance,
  readValueFromInstance,
  removeValueFromRenderState,
  sortNodePosition,
  scrapeMotionValuesFromProps: scrapeMotionValuesFromProps2
}) => ({
  parent,
  props,
  presenceId,
  blockInitialAnimation,
  visualState,
  shouldReduceMotion
}, options = {}) => {
  let isMounted = false;
  const { latestValues, renderState } = visualState;
  let instance;
  const lifecycles = createLifecycles();
  const values = /* @__PURE__ */ new Map();
  const valueSubscriptions = /* @__PURE__ */ new Map();
  let prevMotionValues = {};
  const baseTarget = __spreadValues({}, latestValues);
  let removeFromVariantTree;
  function render() {
    if (!instance || !isMounted)
      return;
    triggerBuild();
    renderInstance(instance, renderState, props.style, element.projection);
  }
  function triggerBuild() {
    build(element, renderState, latestValues, options, props);
  }
  function update() {
    lifecycles.notifyUpdate(latestValues);
  }
  function bindToMotionValue(key, value) {
    const removeOnChange = value.onChange((latestValue) => {
      latestValues[key] = latestValue;
      props.onUpdate && sync.update(update, false, true);
    });
    const removeOnRenderRequest = value.onRenderRequest(element.scheduleRender);
    valueSubscriptions.set(key, () => {
      removeOnChange();
      removeOnRenderRequest();
    });
  }
  const initialMotionValues = scrapeMotionValuesFromProps2(props);
  for (const key in initialMotionValues) {
    const value = initialMotionValues[key];
    if (latestValues[key] !== void 0 && isMotionValue(value)) {
      value.set(latestValues[key], false);
    }
  }
  const isControllingVariants = checkIfControllingVariants(props);
  const isVariantNode = checkIfVariantNode(props);
  const element = __spreadProps(__spreadValues({
    treeType,
    current: null,
    depth: parent ? parent.depth + 1 : 0,
    parent,
    children: /* @__PURE__ */ new Set(),
    presenceId,
    shouldReduceMotion,
    variantChildren: isVariantNode ? /* @__PURE__ */ new Set() : void 0,
    isVisible: void 0,
    manuallyAnimateOnMount: Boolean(parent == null ? void 0 : parent.isMounted()),
    blockInitialAnimation,
    isMounted: () => Boolean(instance),
    mount(newInstance) {
      isMounted = true;
      instance = element.current = newInstance;
      if (element.projection) {
        element.projection.mount(newInstance);
      }
      if (isVariantNode && parent && !isControllingVariants) {
        removeFromVariantTree = parent == null ? void 0 : parent.addVariantChild(element);
      }
      values.forEach((value, key) => bindToMotionValue(key, value));
      parent == null ? void 0 : parent.children.add(element);
      element.setProps(props);
    },
    unmount() {
      var _a;
      (_a = element.projection) == null ? void 0 : _a.unmount();
      cancelSync.update(update);
      cancelSync.render(render);
      valueSubscriptions.forEach((remove) => remove());
      removeFromVariantTree == null ? void 0 : removeFromVariantTree();
      parent == null ? void 0 : parent.children.delete(element);
      lifecycles.clearAllListeners();
      instance = void 0;
      isMounted = false;
    },
    addVariantChild(child) {
      var _a;
      const closestVariantNode = element.getClosestVariantNode();
      if (closestVariantNode) {
        (_a = closestVariantNode.variantChildren) == null ? void 0 : _a.add(child);
        return () => closestVariantNode.variantChildren.delete(child);
      }
    },
    sortNodePosition(other) {
      if (!sortNodePosition || treeType !== other.treeType)
        return 0;
      return sortNodePosition(element.getInstance(), other.getInstance());
    },
    getClosestVariantNode: () => isVariantNode ? element : parent == null ? void 0 : parent.getClosestVariantNode(),
    getLayoutId: () => props.layoutId,
    getInstance: () => instance,
    getStaticValue: (key) => latestValues[key],
    setStaticValue: (key, value) => latestValues[key] = value,
    getLatestValues: () => latestValues,
    setVisibility(visibility) {
      if (element.isVisible === visibility)
        return;
      element.isVisible = visibility;
      element.scheduleRender();
    },
    makeTargetAnimatable(target, canMutate = true) {
      return makeTargetAnimatable(element, target, props, canMutate);
    },
    measureViewportBox() {
      return measureViewportBox2(instance, props);
    },
    addValue(key, value) {
      if (element.hasValue(key))
        element.removeValue(key);
      values.set(key, value);
      latestValues[key] = value.get();
      bindToMotionValue(key, value);
    },
    removeValue(key) {
      var _a;
      values.delete(key);
      (_a = valueSubscriptions.get(key)) == null ? void 0 : _a();
      valueSubscriptions.delete(key);
      delete latestValues[key];
      removeValueFromRenderState(key, renderState);
    },
    hasValue: (key) => values.has(key),
    getValue(key, defaultValue) {
      let value = values.get(key);
      if (value === void 0 && defaultValue !== void 0) {
        value = motionValue$1(defaultValue);
        element.addValue(key, value);
      }
      return value;
    },
    forEachValue: (callback) => values.forEach(callback),
    readValue: (key) => {
      var _a;
      return (_a = latestValues[key]) != null ? _a : readValueFromInstance(instance, key, options);
    },
    setBaseTarget(key, value) {
      baseTarget[key] = value;
    },
    getBaseTarget(key) {
      if (getBaseTarget) {
        const target = getBaseTarget(props, key);
        if (target !== void 0 && !isMotionValue(target))
          return target;
      }
      return baseTarget[key];
    }
  }, lifecycles), {
    build() {
      triggerBuild();
      return renderState;
    },
    scheduleRender() {
      sync.render(render, false, true);
    },
    syncRender: render,
    setProps(newProps) {
      if (newProps.transformTemplate || props.transformTemplate) {
        element.scheduleRender();
      }
      props = newProps;
      lifecycles.updatePropListeners(newProps);
      prevMotionValues = updateMotionValuesFromProps(element, scrapeMotionValuesFromProps2(props), prevMotionValues);
    },
    getProps: () => props,
    getVariant: (name) => {
      var _a;
      return (_a = props.variants) == null ? void 0 : _a[name];
    },
    getDefaultTransition: () => props.transition,
    getTransformPagePoint: () => {
      return props.transformPagePoint;
    },
    getVariantContext(startAtParent = false) {
      if (startAtParent)
        return parent == null ? void 0 : parent.getVariantContext();
      if (!isControllingVariants) {
        const context2 = (parent == null ? void 0 : parent.getVariantContext()) || {};
        if (props.initial !== void 0) {
          context2.initial = props.initial;
        }
        return context2;
      }
      const context = {};
      for (let i = 0; i < numVariantProps; i++) {
        const name = variantProps[i];
        const prop = props[name];
        if (isVariantLabel(prop) || prop === false) {
          context[name] = prop;
        }
      }
      return context;
    }
  });
  return element;
};
const variantProps = ["initial", ...variantPriorityOrder];
const numVariantProps = variantProps.length;
const translateAlias = {
  x: "translateX",
  y: "translateY",
  z: "translateZ",
  transformPerspective: "perspective"
};
function buildTransform({ transform: transform2, transformKeys: transformKeys2 }, {
  enableHardwareAcceleration = true,
  allowTransformNone = true
}, transformIsDefault, transformTemplate) {
  let transformString = "";
  transformKeys2.sort(sortTransformProps);
  let transformHasZ = false;
  const numTransformKeys = transformKeys2.length;
  for (let i = 0; i < numTransformKeys; i++) {
    const key = transformKeys2[i];
    transformString += `${translateAlias[key] || key}(${transform2[key]}) `;
    if (key === "z")
      transformHasZ = true;
  }
  if (!transformHasZ && enableHardwareAcceleration) {
    transformString += "translateZ(0)";
  } else {
    transformString = transformString.trim();
  }
  if (transformTemplate) {
    transformString = transformTemplate(transform2, transformIsDefault ? "" : transformString);
  } else if (allowTransformNone && transformIsDefault) {
    transformString = "none";
  }
  return transformString;
}
function buildTransformOrigin({
  originX = "50%",
  originY = "50%",
  originZ = 0
}) {
  return `${originX} ${originY} ${originZ}`;
}
function isCSSVariable$1(key) {
  return key.startsWith("--");
}
const getValueAsType = (value, type) => {
  return type && typeof value === "number" ? type.transform(value) : value;
};
function buildHTMLStyles(state, latestValues, options, transformTemplate) {
  var _a;
  const { style, vars, transform: transform2, transformKeys: transformKeys2, transformOrigin } = state;
  transformKeys2.length = 0;
  let hasTransform2 = false;
  let hasTransformOrigin = false;
  let transformIsNone = true;
  for (const key in latestValues) {
    const value = latestValues[key];
    if (isCSSVariable$1(key)) {
      vars[key] = value;
      continue;
    }
    const valueType = numberValueTypes[key];
    const valueAsType = getValueAsType(value, valueType);
    if (isTransformProp(key)) {
      hasTransform2 = true;
      transform2[key] = valueAsType;
      transformKeys2.push(key);
      if (!transformIsNone)
        continue;
      if (value !== ((_a = valueType.default) != null ? _a : 0))
        transformIsNone = false;
    } else if (isTransformOriginProp(key)) {
      transformOrigin[key] = valueAsType;
      hasTransformOrigin = true;
    } else {
      style[key] = valueAsType;
    }
  }
  if (hasTransform2) {
    style.transform = buildTransform(state, options, transformIsNone, transformTemplate);
  } else if (transformTemplate) {
    style.transform = transformTemplate({}, "");
  } else if (!latestValues.transform && style.transform) {
    style.transform = "none";
  }
  if (hasTransformOrigin) {
    style.transformOrigin = buildTransformOrigin(transformOrigin);
  }
}
function isCSSVariable(value) {
  return typeof value === "string" && value.startsWith("var(--");
}
const cssVariableRegex = /var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z0-9 ()%#.,-]+)?\)/;
function parseCSSVariable(current) {
  const match = cssVariableRegex.exec(current);
  if (!match)
    return [,];
  const [, token, fallback] = match;
  return [token, fallback];
}
const maxDepth = 4;
function getVariableValue(current, element, depth = 1) {
  invariant(depth <= maxDepth, `Max CSS variable fallback depth detected in property "${current}". This may indicate a circular fallback dependency.`);
  const [token, fallback] = parseCSSVariable(current);
  if (!token)
    return;
  const resolved = window.getComputedStyle(element).getPropertyValue(token);
  if (resolved) {
    return resolved.trim();
  } else if (isCSSVariable(fallback)) {
    return getVariableValue(fallback, element, depth + 1);
  } else {
    return fallback;
  }
}
function resolveCSSVariables(visualElement2, _e, transitionEnd) {
  var target = __objRest(_e, []);
  var _a;
  const element = visualElement2.getInstance();
  if (!(element instanceof Element))
    return { target, transitionEnd };
  if (transitionEnd) {
    transitionEnd = __spreadValues({}, transitionEnd);
  }
  visualElement2.forEachValue((value) => {
    const current = value.get();
    if (!isCSSVariable(current))
      return;
    const resolved = getVariableValue(current, element);
    if (resolved)
      value.set(resolved);
  });
  for (const key in target) {
    const current = target[key];
    if (!isCSSVariable(current))
      continue;
    const resolved = getVariableValue(current, element);
    if (!resolved)
      continue;
    target[key] = resolved;
    if (transitionEnd)
      (_a = transitionEnd[key]) != null ? _a : transitionEnd[key] = current;
  }
  return { target, transitionEnd };
}
const positionalKeys = /* @__PURE__ */ new Set([
  "width",
  "height",
  "top",
  "left",
  "right",
  "bottom",
  "x",
  "y"
]);
const isPositionalKey = (key) => positionalKeys.has(key);
const hasPositionalKey = (target) => {
  return Object.keys(target).some(isPositionalKey);
};
const setAndResetVelocity = (value, to) => {
  value.set(to, false);
  value.set(to);
};
const isNumOrPxType = (v2) => v2 === number || v2 === px;
const getPosFromMatrix = (matrix, pos) => parseFloat(matrix.split(", ")[pos]);
const getTranslateFromMatrix = (pos2, pos3) => (_bbox, { transform: transform2 }) => {
  if (transform2 === "none" || !transform2)
    return 0;
  const matrix3d = transform2.match(/^matrix3d\((.+)\)$/);
  if (matrix3d) {
    return getPosFromMatrix(matrix3d[1], pos3);
  } else {
    const matrix = transform2.match(/^matrix\((.+)\)$/);
    if (matrix) {
      return getPosFromMatrix(matrix[1], pos2);
    } else {
      return 0;
    }
  }
};
const transformKeys = /* @__PURE__ */ new Set(["x", "y", "z"]);
const nonTranslationalTransformKeys = transformProps.filter((key) => !transformKeys.has(key));
function removeNonTranslationalTransform(visualElement2) {
  const removedTransforms = [];
  nonTranslationalTransformKeys.forEach((key) => {
    const value = visualElement2.getValue(key);
    if (value !== void 0) {
      removedTransforms.push([key, value.get()]);
      value.set(key.startsWith("scale") ? 1 : 0);
    }
  });
  if (removedTransforms.length)
    visualElement2.syncRender();
  return removedTransforms;
}
const positionalValues = {
  width: ({ x: x2 }, { paddingLeft = "0", paddingRight = "0" }) => x2.max - x2.min - parseFloat(paddingLeft) - parseFloat(paddingRight),
  height: ({ y: y2 }, { paddingTop = "0", paddingBottom = "0" }) => y2.max - y2.min - parseFloat(paddingTop) - parseFloat(paddingBottom),
  top: (_bbox, { top }) => parseFloat(top),
  left: (_bbox, { left }) => parseFloat(left),
  bottom: ({ y: y2 }, { top }) => parseFloat(top) + (y2.max - y2.min),
  right: ({ x: x2 }, { left }) => parseFloat(left) + (x2.max - x2.min),
  x: getTranslateFromMatrix(4, 13),
  y: getTranslateFromMatrix(5, 14)
};
const convertChangedValueTypes = (target, visualElement2, changedKeys) => {
  const originBbox = visualElement2.measureViewportBox();
  const element = visualElement2.getInstance();
  const elementComputedStyle = getComputedStyle(element);
  const { display } = elementComputedStyle;
  const origin = {};
  if (display === "none") {
    visualElement2.setStaticValue("display", target.display || "block");
  }
  changedKeys.forEach((key) => {
    origin[key] = positionalValues[key](originBbox, elementComputedStyle);
  });
  visualElement2.syncRender();
  const targetBbox = visualElement2.measureViewportBox();
  changedKeys.forEach((key) => {
    const value = visualElement2.getValue(key);
    setAndResetVelocity(value, origin[key]);
    target[key] = positionalValues[key](targetBbox, elementComputedStyle);
  });
  return target;
};
const checkAndConvertChangedValueTypes = (visualElement2, target, origin = {}, transitionEnd = {}) => {
  target = __spreadValues({}, target);
  transitionEnd = __spreadValues({}, transitionEnd);
  const targetPositionalKeys = Object.keys(target).filter(isPositionalKey);
  let removedTransformValues = [];
  let hasAttemptedToRemoveTransformValues = false;
  const changedValueTypeKeys = [];
  targetPositionalKeys.forEach((key) => {
    const value = visualElement2.getValue(key);
    if (!visualElement2.hasValue(key))
      return;
    let from = origin[key];
    let fromType = findDimensionValueType(from);
    const to = target[key];
    let toType;
    if (isKeyframesTarget(to)) {
      const numKeyframes = to.length;
      const fromIndex = to[0] === null ? 1 : 0;
      from = to[fromIndex];
      fromType = findDimensionValueType(from);
      for (let i = fromIndex; i < numKeyframes; i++) {
        if (!toType) {
          toType = findDimensionValueType(to[i]);
          invariant(toType === fromType || isNumOrPxType(fromType) && isNumOrPxType(toType), "Keyframes must be of the same dimension as the current value");
        } else {
          invariant(findDimensionValueType(to[i]) === toType, "All keyframes must be of the same type");
        }
      }
    } else {
      toType = findDimensionValueType(to);
    }
    if (fromType !== toType) {
      if (isNumOrPxType(fromType) && isNumOrPxType(toType)) {
        const current = value.get();
        if (typeof current === "string") {
          value.set(parseFloat(current));
        }
        if (typeof to === "string") {
          target[key] = parseFloat(to);
        } else if (Array.isArray(to) && toType === px) {
          target[key] = to.map(parseFloat);
        }
      } else if ((fromType == null ? void 0 : fromType.transform) && (toType == null ? void 0 : toType.transform) && (from === 0 || to === 0)) {
        if (from === 0) {
          value.set(toType.transform(from));
        } else {
          target[key] = fromType.transform(to);
        }
      } else {
        if (!hasAttemptedToRemoveTransformValues) {
          removedTransformValues = removeNonTranslationalTransform(visualElement2);
          hasAttemptedToRemoveTransformValues = true;
        }
        changedValueTypeKeys.push(key);
        transitionEnd[key] = transitionEnd[key] !== void 0 ? transitionEnd[key] : target[key];
        setAndResetVelocity(value, to);
      }
    }
  });
  if (changedValueTypeKeys.length) {
    const convertedTarget = convertChangedValueTypes(target, visualElement2, changedValueTypeKeys);
    if (removedTransformValues.length) {
      removedTransformValues.forEach(([key, value]) => {
        visualElement2.getValue(key).set(value);
      });
    }
    visualElement2.syncRender();
    return { target: convertedTarget, transitionEnd };
  } else {
    return { target, transitionEnd };
  }
};
function unitConversion(visualElement2, target, origin, transitionEnd) {
  return hasPositionalKey(target) ? checkAndConvertChangedValueTypes(visualElement2, target, origin, transitionEnd) : { target, transitionEnd };
}
const parseDomVariant = (visualElement2, target, origin, transitionEnd) => {
  const resolved = resolveCSSVariables(visualElement2, target, transitionEnd);
  target = resolved.target;
  transitionEnd = resolved.transitionEnd;
  return unitConversion(visualElement2, target, origin, transitionEnd);
};
function isForcedMotionValue(key, { layout, layoutId }) {
  return isTransformProp(key) || isTransformOriginProp(key) || (layout || layoutId !== void 0) && (!!scaleCorrectors[key] || key === "opacity");
}
function scrapeMotionValuesFromProps$1(props) {
  const { style } = props;
  const newValues = {};
  for (const key in style) {
    if (isMotionValue(style[key]) || isForcedMotionValue(key, props)) {
      newValues[key] = style[key];
    }
  }
  return newValues;
}
function renderHTML(element, { style, vars }, styleProp, projection) {
  Object.assign(element.style, style, projection && projection.getProjectionStyles(styleProp));
  for (const key in vars) {
    element.style.setProperty(key, vars[key]);
  }
}
function getComputedStyle$1(element) {
  return window.getComputedStyle(element);
}
const htmlConfig = {
  treeType: "dom",
  readValueFromInstance(domElement, key) {
    if (isTransformProp(key)) {
      const defaultType = getDefaultValueType(key);
      return defaultType ? defaultType.default || 0 : 0;
    } else {
      const computedStyle = getComputedStyle$1(domElement);
      return (isCSSVariable$1(key) ? computedStyle.getPropertyValue(key) : computedStyle[key]) || 0;
    }
  },
  sortNodePosition(a, b) {
    return a.compareDocumentPosition(b) & 2 ? 1 : -1;
  },
  getBaseTarget(props, key) {
    var _a;
    return (_a = props.style) == null ? void 0 : _a[key];
  },
  measureViewportBox(element, { transformPagePoint }) {
    return measureViewportBox(element, transformPagePoint);
  },
  resetTransform(element, domElement, props) {
    const { transformTemplate } = props;
    domElement.style.transform = transformTemplate ? transformTemplate({}, "") : "none";
    element.scheduleRender();
  },
  restoreTransform(instance, mutableState) {
    instance.style.transform = mutableState.style.transform;
  },
  removeValueFromRenderState(key, { vars, style }) {
    delete vars[key];
    delete style[key];
  },
  makeTargetAnimatable(element, _f, { transformValues }, isMounted = true) {
    var _g = _f, { transition, transitionEnd } = _g, target = __objRest(_g, ["transition", "transitionEnd"]);
    let origin = getOrigin(target, transition || {}, element);
    if (transformValues) {
      if (transitionEnd)
        transitionEnd = transformValues(transitionEnd);
      if (target)
        target = transformValues(target);
      if (origin)
        origin = transformValues(origin);
    }
    if (isMounted) {
      checkTargetForNewValues(element, target, origin);
      const parsed = parseDomVariant(element, target, origin, transitionEnd);
      transitionEnd = parsed.transitionEnd;
      target = parsed.target;
    }
    return __spreadValues({
      transition,
      transitionEnd
    }, target);
  },
  scrapeMotionValuesFromProps: scrapeMotionValuesFromProps$1,
  build(element, renderState, latestValues, options, props) {
    if (element.isVisible !== void 0) {
      renderState.style.visibility = element.isVisible ? "visible" : "hidden";
    }
    buildHTMLStyles(renderState, latestValues, options, props.transformTemplate);
  },
  render: renderHTML
};
const htmlVisualElement = visualElement(htmlConfig);
function scrapeMotionValuesFromProps(props) {
  const newValues = scrapeMotionValuesFromProps$1(props);
  for (const key in props) {
    if (isMotionValue(props[key])) {
      const targetKey = key === "x" || key === "y" ? "attr" + key.toUpperCase() : key;
      newValues[targetKey] = props[key];
    }
  }
  return newValues;
}
function calcOrigin(origin, offset, size) {
  return typeof origin === "string" ? origin : px.transform(offset + size * origin);
}
function calcSVGTransformOrigin(dimensions, originX, originY) {
  const pxOriginX = calcOrigin(originX, dimensions.x, dimensions.width);
  const pxOriginY = calcOrigin(originY, dimensions.y, dimensions.height);
  return `${pxOriginX} ${pxOriginY}`;
}
const dashKeys = {
  offset: "stroke-dashoffset",
  array: "stroke-dasharray"
};
const camelKeys = {
  offset: "strokeDashoffset",
  array: "strokeDasharray"
};
function buildSVGPath(attrs, length, spacing = 1, offset = 0, useDashCase = true) {
  attrs.pathLength = 1;
  const keys = useDashCase ? dashKeys : camelKeys;
  attrs[keys.offset] = px.transform(-offset);
  const pathLength = px.transform(length);
  const pathSpacing = px.transform(spacing);
  attrs[keys.array] = `${pathLength} ${pathSpacing}`;
}
function buildSVGAttrs(state, _h, options, transformTemplate) {
  var _i = _h, {
    attrX,
    attrY,
    originX,
    originY,
    pathLength,
    pathSpacing = 1,
    pathOffset = 0
  } = _i, latest = __objRest(_i, [
    "attrX",
    "attrY",
    "originX",
    "originY",
    "pathLength",
    "pathSpacing",
    "pathOffset"
  ]);
  buildHTMLStyles(state, latest, options, transformTemplate);
  state.attrs = state.style;
  state.style = {};
  const { attrs, style, dimensions } = state;
  if (attrs.transform) {
    if (dimensions)
      style.transform = attrs.transform;
    delete attrs.transform;
  }
  if (dimensions && (originX !== void 0 || originY !== void 0 || style.transform)) {
    style.transformOrigin = calcSVGTransformOrigin(dimensions, originX !== void 0 ? originX : 0.5, originY !== void 0 ? originY : 0.5);
  }
  if (attrX !== void 0)
    attrs.x = attrX;
  if (attrY !== void 0)
    attrs.y = attrY;
  if (pathLength !== void 0) {
    buildSVGPath(attrs, pathLength, pathSpacing, pathOffset, false);
  }
}
const CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g;
const REPLACE_TEMPLATE = "$1-$2";
const camelToDash = (str) => str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase();
const camelCaseAttributes = /* @__PURE__ */ new Set([
  "baseFrequency",
  "diffuseConstant",
  "kernelMatrix",
  "kernelUnitLength",
  "keySplines",
  "keyTimes",
  "limitingConeAngle",
  "markerHeight",
  "markerWidth",
  "numOctaves",
  "targetX",
  "targetY",
  "surfaceScale",
  "specularConstant",
  "specularExponent",
  "stdDeviation",
  "tableValues",
  "viewBox",
  "gradientTransform",
  "pathLength"
]);
function renderSVG(element, renderState, _styleProp, projection) {
  renderHTML(element, renderState, void 0, projection);
  for (const key in renderState.attrs) {
    element.setAttribute(!camelCaseAttributes.has(key) ? camelToDash(key) : key, renderState.attrs[key]);
  }
}
const svgVisualElement = visualElement(__spreadProps(__spreadValues({}, htmlConfig), {
  getBaseTarget(props, key) {
    return props[key];
  },
  readValueFromInstance(domElement, key) {
    var _a;
    if (isTransformProp(key)) {
      return ((_a = getDefaultValueType(key)) == null ? void 0 : _a.default) || 0;
    }
    key = !camelCaseAttributes.has(key) ? camelToDash(key) : key;
    return domElement.getAttribute(key);
  },
  scrapeMotionValuesFromProps,
  build(_element, renderState, latestValues, options, props) {
    buildSVGAttrs(renderState, latestValues, options, props.transformTemplate);
  },
  render: renderSVG
}));
const lowercaseSVGElements = [
  "animate",
  "circle",
  "defs",
  "desc",
  "ellipse",
  "g",
  "image",
  "line",
  "filter",
  "marker",
  "mask",
  "metadata",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "rect",
  "stop",
  "svg",
  "switch",
  "symbol",
  "text",
  "tspan",
  "use",
  "view"
];
function isSVGComponent(Component) {
  if (typeof Component !== "string" || Component.includes("-")) {
    return false;
  } else if (lowercaseSVGElements.indexOf(Component) > -1 || /[A-Z]/.test(Component)) {
    return true;
  }
  return false;
}
const isCustomValueType = (v2) => {
  return typeof v2 === "object" && v2.mix;
};
const getMixer = (v2) => isCustomValueType(v2) ? v2.mix : void 0;
function transform(...args) {
  const useImmediate = !Array.isArray(args[0]);
  const argOffset = useImmediate ? 0 : -1;
  const inputValue = args[0 + argOffset];
  const inputRange = args[1 + argOffset];
  const outputRange = args[2 + argOffset];
  const options = args[3 + argOffset];
  const interpolator = interpolate(inputRange, outputRange, __spreadValues({
    mixer: getMixer(outputRange[0])
  }, options));
  return useImmediate ? interpolator(inputValue) : interpolator;
}
function motionValue(init) {
  return new MotionValue(init);
}
function useTransform(input, inputRangeOrTransformer, outputRange, options) {
  const transformer = typeof inputRangeOrTransformer === "function" ? inputRangeOrTransformer : transform(inputRangeOrTransformer, outputRange, options);
  return Array.isArray(input) ? useListTransform(input, transformer) : useListTransform([input], ([latest]) => transformer(latest));
}
function useListTransform(values, transformer) {
  const latest = [];
  return useCombineMotionValues(values, () => {
    latest.length = 0;
    const numValues = values.length;
    for (let i = 0; i < numValues; i++) {
      latest[i] = values[i].get();
    }
    return transformer(latest);
  });
}
function useCombineMotionValues(values, combineValues) {
  const value = motionValue(combineValues());
  const updateValue = () => value.set(combineValues());
  updateValue();
  const handler = () => sync.update(updateValue, false, true);
  const subscriptions = values.map((value2) => value2.onChange(handler));
  value.unmount = () => subscriptions.forEach((unsubscribe) => unsubscribe());
  return value;
}
const isNodeOrChild = (parent, child) => {
  if (!child) {
    return false;
  } else if (parent === child) {
    return true;
  } else {
    return isNodeOrChild(parent, child.parentElement);
  }
};
const observerCallbacks = /* @__PURE__ */ new WeakMap();
const observers = /* @__PURE__ */ new WeakMap();
const fireObserverCallback = (entry) => {
  var _a;
  (_a = observerCallbacks.get(entry.target)) == null ? void 0 : _a(entry);
};
const fireAllObserverCallbacks = (entries) => {
  entries.forEach(fireObserverCallback);
};
function initIntersectionObserver(_j) {
  var _k = _j, {
    root
  } = _k, options = __objRest(_k, [
    "root"
  ]);
  const lookupRoot = root || document;
  if (!observers.has(lookupRoot)) {
    observers.set(lookupRoot, {});
  }
  const rootObservers = observers.get(lookupRoot);
  const key = JSON.stringify(options);
  if (!rootObservers[key]) {
    rootObservers[key] = new IntersectionObserver(fireAllObserverCallbacks, __spreadValues({ root }, options));
  }
  return rootObservers[key];
}
function observeIntersection(element, options, callback) {
  const rootInteresectionObserver = initIntersectionObserver(options);
  observerCallbacks.set(element, callback);
  rootInteresectionObserver.observe(element);
  return () => {
    observerCallbacks.delete(element);
    rootInteresectionObserver.unobserve(element);
  };
}
function pixelsToPercent(pixels, axis) {
  if (axis.max === axis.min)
    return 0;
  return pixels / (axis.max - axis.min) * 100;
}
const correctBorderRadius = {
  correct: (latest, node) => {
    if (!node.target)
      return latest;
    if (typeof latest === "string") {
      if (px.test(latest)) {
        latest = parseFloat(latest);
      } else {
        return latest;
      }
    }
    const x2 = pixelsToPercent(latest, node.target.x);
    const y2 = pixelsToPercent(latest, node.target.y);
    return `${x2}% ${y2}%`;
  }
};
const varToken = "_$css";
const correctBoxShadow = {
  correct: (latest, { treeScale, projectionDelta }) => {
    const original = latest;
    const containsCSSVariables = latest.includes("var(");
    const cssVariables = [];
    if (containsCSSVariables) {
      latest = latest.replace(cssVariableRegex, (match) => {
        cssVariables.push(match);
        return varToken;
      });
    }
    const shadow = complex.parse(latest);
    if (shadow.length > 5)
      return original;
    const template = complex.createTransformer(latest);
    const offset = typeof shadow[0] !== "number" ? 1 : 0;
    const xScale = projectionDelta.x.scale * treeScale.x;
    const yScale = projectionDelta.y.scale * treeScale.y;
    shadow[0 + offset] /= xScale;
    shadow[1 + offset] /= yScale;
    const averageScale = mix(xScale, yScale, 0.5);
    if (typeof shadow[2 + offset] === "number")
      shadow[2 + offset] /= averageScale;
    if (typeof shadow[3 + offset] === "number")
      shadow[3 + offset] /= averageScale;
    let output = template(shadow);
    if (containsCSSVariables) {
      let i = 0;
      output = output.replace(varToken, () => {
        const cssVariable = cssVariables[i];
        i++;
        return cssVariable;
      });
    }
    return output;
  }
};
const createHtmlRenderState = () => ({
  style: {},
  transform: {},
  transformKeys: [],
  transformOrigin: {},
  vars: {}
});
function makeVisualState(props, context, presenceContext) {
  const renderState = createHtmlRenderState();
  const state = {
    latestValues: makeLatestValues(props, context, presenceContext),
    renderState
  };
  return state;
}
function makeLatestValues(props, context, presenceContext) {
  const values = {};
  const blockInitialAnimation = (presenceContext == null ? void 0 : presenceContext.initial) === false;
  const motionValues = scrapeMotionValuesFromProps$1(props);
  for (const key in motionValues) {
    values[key] = resolveMotionValue(motionValues[key]);
  }
  let { initial, animate: animate2 } = props;
  const isControllingVariants = checkIfControllingVariants(props);
  const isVariantNode = checkIfVariantNode(props);
  if (context && isVariantNode && !isControllingVariants && props.inherit !== false) {
    initial != null ? initial : initial = context.initial;
    animate2 != null ? animate2 : animate2 = context.animate;
  }
  const initialAnimationIsBlocked = blockInitialAnimation || initial === false;
  const variantToSet = initialAnimationIsBlocked ? animate2 : initial;
  if (variantToSet && typeof variantToSet !== "boolean" && !isAnimationControls(variantToSet)) {
    const list = Array.isArray(variantToSet) ? variantToSet : [variantToSet];
    list.forEach((definition) => {
      const resolved = resolveVariantFromProps(props, definition);
      if (!resolved)
        return;
      const _a = resolved, { transitionEnd, transition } = _a, target = __objRest(_a, ["transitionEnd", "transition"]);
      for (const key in target) {
        let valueTarget = target[key];
        if (Array.isArray(valueTarget)) {
          const index = initialAnimationIsBlocked ? valueTarget.length - 1 : 0;
          valueTarget = valueTarget[index];
        }
        if (valueTarget !== null) {
          values[key] = valueTarget;
        }
      }
      for (const key in transitionEnd)
        values[key] = transitionEnd[key];
    });
  }
  return values;
}
const MeasureLayoutWithContext = {
  componentDidMount(props) {
    const { visualElement: visualElement2, layoutGroup, switchLayoutGroup, layoutId } = props;
    const { projection } = visualElement2;
    addScaleCorrector(defaultScaleCorrectors);
    if (projection) {
      if (layoutGroup == null ? void 0 : layoutGroup.group)
        layoutGroup.group.add(projection);
      if ((switchLayoutGroup == null ? void 0 : switchLayoutGroup.register) && layoutId) {
        switchLayoutGroup.register(projection);
      }
      projection.root.didUpdate();
      projection.addEventListener("animationComplete", () => {
        this.safeToRemove(props);
      });
      projection.setOptions(__spreadProps(__spreadValues({}, projection.options), {
        onExitComplete: () => this.safeToRemove(props)
      }));
    }
    globalProjectionState.hasEverUpdated = true;
  },
  getSnapshotBeforeUpdate(props, prevProps) {
    const { layoutDependency, visualElement: visualElement2, drag, isPresent } = props;
    const projection = visualElement2.projection;
    if (!projection)
      return null;
    projection.isPresent = isPresent;
    if (drag || prevProps.layoutDependency !== layoutDependency || layoutDependency === void 0) {
      projection.willUpdate();
    } else {
      this.safeToRemove(props);
    }
    if (prevProps.isPresent !== isPresent) {
      if (isPresent) {
        projection.promote();
      } else if (!projection.relegate()) {
        sync.postRender(() => {
          var _a;
          if (!((_a = projection.getStack()) == null ? void 0 : _a.members.length)) {
            this.safeToRemove(props);
          }
        });
      }
    }
    return null;
  },
  componentDidUpdate(props) {
    const { projection } = props.visualElement;
    if (projection) {
      projection.root.didUpdate();
      if (!projection.currentAnimation && projection.isLead()) {
        this.safeToRemove(props);
      }
    }
  },
  componentWillUnmount(props) {
    const {
      visualElement: visualElement2,
      layoutGroup,
      switchLayoutGroup: promoteContext
    } = props;
    const { projection } = visualElement2;
    if (projection) {
      projection.scheduleCheckAfterUnmount();
      if (layoutGroup == null ? void 0 : layoutGroup.group)
        layoutGroup.group.remove(projection);
      if (promoteContext == null ? void 0 : promoteContext.deregister)
        promoteContext.deregister(projection);
    }
  },
  safeToRemove(props) {
    const { safeToRemove } = props;
    safeToRemove == null ? void 0 : safeToRemove();
  }
};
const defaultScaleCorrectors = {
  borderRadius: __spreadProps(__spreadValues({}, correctBorderRadius), {
    applyTo: [
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomLeftRadius",
      "borderBottomRightRadius"
    ]
  }),
  borderTopLeftRadius: correctBorderRadius,
  borderTopRightRadius: correctBorderRadius,
  borderBottomLeftRadius: correctBorderRadius,
  borderBottomRightRadius: correctBorderRadius,
  boxShadow: correctBoxShadow
};
function useProjection(projectionId, { layoutId, layout, drag, dragConstraints, layoutScroll }, initialPromotionConfig, visualElement2, ProjectionNodeConstructor) {
  var _a;
  if (!ProjectionNodeConstructor || !visualElement2 || (visualElement2 == null ? void 0 : visualElement2.projection)) {
    return;
  }
  visualElement2.projection = new ProjectionNodeConstructor(projectionId, visualElement2.getLatestValues(), (_a = visualElement2.parent) == null ? void 0 : _a.projection);
  visualElement2.projection.setOptions({
    layoutId,
    layout,
    alwaysMeasureLayout: Boolean(drag),
    visualElement: visualElement2,
    scheduleRender: () => visualElement2.scheduleRender(),
    animationType: typeof layout === "string" ? layout : "both",
    initialPromotionConfig,
    layoutScroll
  });
}
function createHoverEvent(visualElement2, isActive, callback) {
  return (event, info) => {
    var _a;
    if (!isMouseEvent(event) || isDragActive())
      return;
    (_a = visualElement2.animationState) == null ? void 0 : _a.setActive(AnimationType.Hover, isActive);
    callback == null ? void 0 : callback(event, info);
  };
}
function useHoverGesture({ visualElement: visualElement2, onHoverStart, whileHover, onHoverEnd }) {
  if (onHoverStart || whileHover) {
    addPointerEvent(visualElement2.getInstance(), "pointerenter", createHoverEvent(visualElement2, true, onHoverStart));
  }
  if (onHoverEnd || whileHover) {
    addPointerEvent(visualElement2.getInstance(), "pointerleave", createHoverEvent(visualElement2, false, onHoverEnd));
  }
}
function useTapGesture({
  onTap,
  onTapStart,
  onTapCancel,
  whileTap,
  visualElement: visualElement2
}) {
  const hasPressListeners = onTap || onTapStart || onTapCancel || whileTap;
  let isPressing = false;
  let cancelPointerEndListeners = null;
  function removePointerEndListener() {
    if (cancelPointerEndListeners) {
      cancelPointerEndListeners();
    }
    cancelPointerEndListeners = null;
  }
  function checkPointerEnd() {
    var _a;
    removePointerEndListener();
    isPressing = false;
    (_a = visualElement2.animationState) == null ? void 0 : _a.setActive(AnimationType.Tap, false);
    return !isDragActive();
  }
  function onPointerUp(event, info) {
    if (!checkPointerEnd())
      return;
    !isNodeOrChild(visualElement2.getInstance(), event.target) ? onTapCancel == null ? void 0 : onTapCancel(event, info) : onTap == null ? void 0 : onTap(event, info);
  }
  function onPointerCancel(event, info) {
    if (!checkPointerEnd())
      return;
    onTapCancel == null ? void 0 : onTapCancel(event, info);
  }
  function onPointerDown(event, info) {
    var _a;
    removePointerEndListener();
    if (isPressing)
      return;
    isPressing = true;
    cancelPointerEndListeners = pipe(addPointerEvent(window, "pointerup", onPointerUp), addPointerEvent(window, "pointercancel", onPointerCancel));
    (_a = visualElement2.animationState) == null ? void 0 : _a.setActive(AnimationType.Tap, true);
    onTapStart == null ? void 0 : onTapStart(event, info);
  }
  if (hasPressListeners) {
    addPointerEvent(visualElement2.getInstance(), "pointerdown", onPointerDown);
  }
  return removePointerEndListener;
}
function useFocusGesture({ whileFocus, visualElement: visualElement2 }) {
  const onFocus = () => {
    var _a;
    (_a = visualElement2.animationState) == null ? void 0 : _a.setActive(AnimationType.Focus, true);
  };
  const onBlur = () => {
    var _a;
    (_a = visualElement2.animationState) == null ? void 0 : _a.setActive(AnimationType.Focus, false);
  };
  if (whileFocus) {
    addDomEvent(visualElement2.getInstance(), "focus", onFocus);
    addDomEvent(visualElement2.getInstance(), "blur", onBlur);
  }
}
function useViewport({
  visualElement: visualElement2,
  whileInView,
  onViewportEnter,
  onViewportLeave,
  viewport = {}
}) {
  const state = {
    hasEnteredView: false,
    isInView: false
  };
  let shouldObserve = Boolean(whileInView || onViewportEnter || onViewportLeave);
  if (viewport.once && state.hasEnteredView)
    shouldObserve = false;
  const useObserver = typeof IntersectionObserver === "undefined" ? useMissingIntersectionObserver : useIntersectionObserver;
  return useObserver(shouldObserve, state, visualElement2, viewport);
}
const thresholdNames = {
  some: 0,
  all: 1
};
function useIntersectionObserver(shouldObserve, state, visualElement2, { root, margin: rootMargin, amount = "some", once }) {
  if (!shouldObserve)
    return;
  const options = {
    root: root == null ? void 0 : root.current,
    rootMargin,
    threshold: typeof amount === "number" ? amount : thresholdNames[amount]
  };
  const intersectionCallback = (entry) => {
    var _a;
    const { isIntersecting } = entry;
    if (state.isInView === isIntersecting)
      return;
    state.isInView = isIntersecting;
    if (once && !isIntersecting && state.hasEnteredView) {
      return;
    } else if (isIntersecting) {
      state.hasEnteredView = true;
    }
    (_a = visualElement2.animationState) == null ? void 0 : _a.setActive(AnimationType.InView, isIntersecting);
    const props = visualElement2.getProps();
    const callback = isIntersecting ? props.onViewportEnter : props.onViewportLeave;
    callback == null ? void 0 : callback(entry);
  };
  return observeIntersection(visualElement2.getInstance(), options, intersectionCallback);
}
function useMissingIntersectionObserver(shouldObserve, state, visualElement2, { fallback = true }) {
  if (!shouldObserve || !fallback)
    return;
  requestAnimationFrame(() => {
    var _a;
    state.hasEnteredView = true;
    const { onViewportEnter } = visualElement2.getProps();
    onViewportEnter == null ? void 0 : onViewportEnter(null);
    (_a = visualElement2.animationState) == null ? void 0 : _a.setActive(AnimationType.InView, true);
  });
}
function usePanGesture({
  onPan,
  onPanStart,
  onPanEnd,
  onPanSessionStart,
  visualElement: visualElement2
}, { transformPagePoint }) {
  const hasPanEvents = onPan || onPanStart || onPanEnd || onPanSessionStart;
  let panSession = null;
  const handlers = {
    onSessionStart: onPanSessionStart,
    onStart: onPanStart,
    onMove: onPan,
    onEnd: (event, info) => {
      panSession = null;
      onPanEnd && onPanEnd(event, info);
    }
  };
  function onPointerDown(event) {
    panSession = new PanSession(event, handlers, {
      transformPagePoint
    });
  }
  if (hasPanEvents) {
    addPointerEvent(visualElement2.getInstance(), "pointerdown", onPointerDown);
  }
  return () => panSession && panSession.end();
}
export { AnimationType, HTMLProjectionNode, MeasureLayoutWithContext, MotionValue, VisualElementDragControls, addPointerEvent, animate, animationControls, createAnimationState, htmlVisualElement, isMotionValue, isSVGComponent, makeVisualState, motionValue, svgVisualElement, useCombineMotionValues, useFocusGesture, useHoverGesture, usePanGesture, useProjection, useTapGesture, useTransform, useViewport };
