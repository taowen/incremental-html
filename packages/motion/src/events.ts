import { Point } from "./geometry"

interface PointerNameMap {
    pointerdown: string
    pointermove: string
    pointerup: string
    pointercancel: string
    pointerover?: string
    pointerout?: string
    pointerenter?: string
    pointerleave?: string
}

const mouseEventNames: PointerNameMap = {
    pointerdown: "mousedown",
    pointermove: "mousemove",
    pointerup: "mouseup",
    pointercancel: "mousecancel",
    pointerover: "mouseover",
    pointerout: "mouseout",
    pointerenter: "mouseenter",
    pointerleave: "mouseleave",
}

const touchEventNames: PointerNameMap = {
    pointerdown: "touchstart",
    pointermove: "touchmove",
    pointerup: "touchend",
    pointercancel: "touchcancel",
}

export interface EventInfo {
    point: Point
}

export type EventListenerWithPointInfo = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: EventInfo
) => void

export function addDomEvent(
    target: EventTarget,
    eventName: string,
    handler: EventListener,
    options?: AddEventListenerOptions
) {
    target.addEventListener(eventName, handler, options)

    return () => target.removeEventListener(eventName, handler, options)
}

export function addPointerEvent(
    target: EventTarget,
    eventName: string,
    handler: EventListenerWithPointInfo,
    options?: AddEventListenerOptions
) {
    return addDomEvent(
        target,
        getPointerEventName(eventName),
        wrapHandler(handler, eventName === "pointerdown"),
        options
    )
}



export const wrapHandler = (
    handler: EventListenerWithPointInfo,
    shouldFilterPrimaryPointer = false
): EventListener => {
    const listener: EventListener = (event: any) =>
        handler(event, extractEventInfo(event))

    return shouldFilterPrimaryPointer
        ? filterPrimaryPointer(listener)
        : listener
}


export function extractEventInfo(
    event: MouseEvent | TouchEvent | PointerEvent,
    pointType: "page" | "client" = "page"
): EventInfo {
    return {
        point: isTouchEvent(event)
            ? pointFromTouch(event, pointType)
            : pointFromMouse(event, pointType),
    }
}

const defaultPagePoint = { pageX: 0, pageY: 0 }

function pointFromTouch(e: TouchEvent, pointType: "page" | "client" = "page") {
    const primaryTouch = e.touches[0] || e.changedTouches[0]
    const point = primaryTouch || defaultPagePoint

    return {
        x: point[pointType + "X"],
        y: point[pointType + "Y"],
    }
}

function pointFromMouse(
    point: MouseEvent | PointerEvent,
    pointType: "page" | "client" = "page"
) {
    return {
        x: point[pointType + "X"],
        y: point[pointType + "Y"],
    }
}

export function isTouchEvent(
    event: MouseEvent | TouchEvent | PointerEvent
): event is TouchEvent {
    const hasTouches = !!(event as TouchEvent).touches
    return hasTouches
}

export function isMouseEvent(
    event: MouseEvent | TouchEvent | PointerEvent
): event is MouseEvent {
    // PointerEvent inherits from MouseEvent so we can't use a straight instanceof check.
    if (typeof PointerEvent !== "undefined" && event instanceof PointerEvent) {
        return !!(event.pointerType === "mouse")
    }

    return event instanceof MouseEvent
}

function getPointerEventName(name: string): string {
    if (supportsPointerEvents()) {
        return name
    } else if (supportsTouchEvents()) {
        return touchEventNames[name]
    } else if (supportsMouseEvents()) {
        return mouseEventNames[name]
    }

    return name
}

let isBrowser = true;

// We check for event support via functions in case they've been mocked by a testing suite.
export const supportsPointerEvents = () =>
    isBrowser && window.onpointerdown === null
export const supportsTouchEvents = () =>
    isBrowser && window.ontouchstart === null
export const supportsMouseEvents = () =>
    isBrowser && window.onmousedown === null


    
/**
 * Filters out events not attached to the primary pointer (currently left mouse button)
 * @param eventHandler
 */
function filterPrimaryPointer(eventHandler: EventListener): EventListener {
    return (event: Event) => {
        const isMouseEvent = event instanceof MouseEvent
        const isPrimaryPointer =
            !isMouseEvent ||
            (isMouseEvent && (event as MouseEvent).button === 0)

        if (isPrimaryPointer) {
            eventHandler(event)
        }
    }
}