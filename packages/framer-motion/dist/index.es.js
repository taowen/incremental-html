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
import sync, { getFrameData, cancelSync } from "framesync";
import { velocityPerSecond, cubicBezier, linear, easeIn, easeInOut, easeOut, circIn, circInOut, circOut, backIn, backInOut, backOut, anticipate, bounceIn, bounceInOut, bounceOut, inertia, animate, mix } from "popmotion";
import { invariant, warning } from "hey-listen";
import { complex, number, px, degrees, scale, alpha, progressPercentage, color, filter, percent, vw, vh } from "style-value-types";
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
    this.updateAndNotify = (v, render = true) => {
      this.prev = this.current;
      this.current = v;
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
  set(v, render = true) {
    if (!render || !this.passiveEffect) {
      this.updateAndNotify(v, render);
    } else {
      this.passiveEffect(v, this.updateAndNotify);
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
function motionValue(init) {
  return new MotionValue(init);
}
const isMotionValue = (value) => {
  return Boolean(value !== null && typeof value === "object" && value.getVelocity);
};
function isAnimationControls(v) {
  return typeof v === "object" && typeof v.start === "function";
}
const isKeyframesTarget = (v) => {
  return Array.isArray(v);
};
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
const isCustomValue = (v) => {
  return Boolean(v && typeof v === "object" && v.mix && v.toValue);
};
const resolveFinalValueInKeyframes = (v) => {
  return isKeyframesTarget(v) ? v[v.length - 1] || 0 : v;
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
      onUpdate: (v) => value.set(v)
    };
    return valueTransition.type === "inertia" || valueTransition.type === "decay" ? inertia(__spreadValues(__spreadValues({}, options), valueTransition)) : animate(__spreadProps(__spreadValues({}, getPopmotionAnimationOptions(valueTransition, options, key)), {
      onUpdate: (v) => {
        var _a2;
        options.onUpdate(v);
        (_a2 = valueTransition.onUpdate) == null ? void 0 : _a2.call(valueTransition, v);
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
const isNumericalString = (v) => /^\-?\d*\.?\d+$/.test(v);
const isZeroValueString = (v) => /^0[^.\s]+$/.test(v);
const testValueType = (v) => (type) => type.test(v);
const auto = {
  test: (v) => v === "auto",
  parse: (v) => v
};
const dimensionValueTypes = [number, px, percent, degrees, vw, vh, auto];
const findDimensionValueType = (v) => dimensionValueTypes.find(testValueType(v));
const valueTypes = [...dimensionValueTypes, color, complex];
const findValueType = (v) => valueTypes.find(testValueType(v));
function isVariantLabels(v) {
  return Array.isArray(v);
}
function isVariantLabel(v) {
  return typeof v === "string" || isVariantLabels(v);
}
function getCurrent(visualElement2) {
  const current = {};
  visualElement2.forEachValue((value, key) => current[key] = value.get());
  return current;
}
function getVelocity(visualElement2) {
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
  return resolveVariantFromProps(props, definition, custom != null ? custom : props.custom, getCurrent(visualElement2), getVelocity(visualElement2));
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
    visualElement2.addValue(key, motionValue(value));
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
    visualElement2.addValue(key, motionValue(value));
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
      element.addValue(key, motionValue(nextValue));
    } else if (prevValue !== nextValue) {
      if (element.hasValue(key)) {
        const existingValue = element.getValue(key);
        !existingValue.hasAnimated && existingValue.set(nextValue);
      } else {
        element.addValue(key, motionValue((_a = element.getStaticValue(key)) != null ? _a : nextValue));
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
        value = motionValue(defaultValue);
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
function buildTransform({ transform, transformKeys: transformKeys2 }, {
  enableHardwareAcceleration = true,
  allowTransformNone = true
}, transformIsDefault, transformTemplate) {
  let transformString = "";
  transformKeys2.sort(sortTransformProps);
  let transformHasZ = false;
  const numTransformKeys = transformKeys2.length;
  for (let i = 0; i < numTransformKeys; i++) {
    const key = transformKeys2[i];
    transformString += `${translateAlias[key] || key}(${transform[key]}) `;
    if (key === "z")
      transformHasZ = true;
  }
  if (!transformHasZ && enableHardwareAcceleration) {
    transformString += "translateZ(0)";
  } else {
    transformString = transformString.trim();
  }
  if (transformTemplate) {
    transformString = transformTemplate(transform, transformIsDefault ? "" : transformString);
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
  const { style, vars, transform, transformKeys: transformKeys2, transformOrigin } = state;
  transformKeys2.length = 0;
  let hasTransform = false;
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
      hasTransform = true;
      transform[key] = valueAsType;
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
  if (hasTransform) {
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
const isNumOrPxType = (v) => v === number || v === px;
const getPosFromMatrix = (matrix, pos) => parseFloat(matrix.split(", ")[pos]);
const getTranslateFromMatrix = (pos2, pos3) => (_bbox, { transform }) => {
  if (transform === "none" || !transform)
    return 0;
  const matrix3d = transform.match(/^matrix3d\((.+)\)$/);
  if (matrix3d) {
    return getPosFromMatrix(matrix3d[1], pos3);
  } else {
    const matrix = transform.match(/^matrix\((.+)\)$/);
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
  width: ({ x }, { paddingLeft = "0", paddingRight = "0" }) => x.max - x.min - parseFloat(paddingLeft) - parseFloat(paddingRight),
  height: ({ y }, { paddingTop = "0", paddingBottom = "0" }) => y.max - y.min - parseFloat(paddingTop) - parseFloat(paddingBottom),
  top: (_bbox, { top }) => parseFloat(top),
  left: (_bbox, { left }) => parseFloat(left),
  bottom: ({ y }, { top }) => parseFloat(top) + (y.max - y.min),
  right: ({ x }, { left }) => parseFloat(left) + (x.max - x.min),
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
const scaleCorrectors = {};
function addScaleCorrector(correctors) {
  Object.assign(scaleCorrectors, correctors);
}
function isForcedMotionValue(key, { layout, layoutId }) {
  return isTransformProp(key) || isTransformOriginProp(key) || (layout || layoutId !== void 0) && (!!scaleCorrectors[key] || key === "opacity");
}
function scrapeMotionValuesFromProps(props) {
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
function transformBoxPoints(point, transformPoint) {
  if (!transformPoint)
    return point;
  const topLeft = transformPoint({ x: point.left, y: point.top });
  const bottomRight = transformPoint({ x: point.right, y: point.bottom });
  return {
    top: topLeft.y,
    left: topLeft.x,
    bottom: bottomRight.y,
    right: bottomRight.x
  };
}
function measureViewportBox(instance, transformPoint) {
  return convertBoundingBoxToBox(transformBoxPoints(instance.getBoundingClientRect(), transformPoint));
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
  scrapeMotionValuesFromProps,
  build(element, renderState, latestValues, options, props) {
    if (element.isVisible !== void 0) {
      renderState.style.visibility = element.isVisible ? "visible" : "hidden";
    }
    buildHTMLStyles(renderState, latestValues, options, props.transformTemplate);
  },
  render: renderHTML
};
const htmlVisualElement = visualElement(htmlConfig);
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
const createHtmlRenderState = () => ({
  style: {},
  transform: {},
  transformKeys: [],
  transformOrigin: {},
  vars: {}
});
function resolveMotionValue(value) {
  const unwrappedValue = isMotionValue(value) ? value.get() : value;
  return isCustomValue(unwrappedValue) ? unwrappedValue.toValue() : unwrappedValue;
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
    const x = pixelsToPercent(latest, node.target.x);
    const y = pixelsToPercent(latest, node.target.y);
    return `${x}% ${y}%`;
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
  const motionValues = scrapeMotionValuesFromProps(props);
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
export { AnimationType, MeasureLayoutWithContext, animationControls, createAnimationState, htmlVisualElement, makeVisualState };
