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
import { velocityPerSecond } from "popmotion";
import { invariant } from "hey-listen";
import { number, px, degrees, scale, alpha, progressPercentage, color, filter, complex, percent, vw, vh } from "style-value-types";
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
const isKeyframesTarget = (v) => {
  return Array.isArray(v);
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
function checkIfControllingVariants(props) {
  var _a;
  return typeof ((_a = props.animate) == null ? void 0 : _a.start) === "function" || isVariantLabel(props.initial) || isVariantLabel(props.animate) || isVariantLabel(props.whileHover) || isVariantLabel(props.whileDrag) || isVariantLabel(props.whileTap) || isVariantLabel(props.whileFocus) || isVariantLabel(props.exit);
}
function checkIfVariantNode(props) {
  return Boolean(checkIfControllingVariants(props) || props.variants);
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
function resolveCSSVariables(visualElement2, _a, transitionEnd) {
  var target = __objRest(_a, []);
  var _a2;
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
      (_a2 = transitionEnd[key]) != null ? _a2 : transitionEnd[key] = current;
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
  makeTargetAnimatable(element, _b, { transformValues }, isMounted = true) {
    var _c = _b, { transition, transitionEnd } = _c, target = __objRest(_c, ["transition", "transitionEnd"]);
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
export { htmlVisualElement };
