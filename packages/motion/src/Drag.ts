import styler, { Styler } from 'stylefire';
import { addPointerEvent } from './events';
import { PanSession } from './PanSession';

export class Drag {
    public style: Styler;
    constructor(props: { element: Element, direction?: 'x' | 'y' }) {
        this.style = styler(props.element);
        addPointerEvent(
            props.element,
            "pointerdown",
            (event) => {
                new PanSession(event, {
                    onMove: (e, panInfo) => {
                        this.style.set({ x: panInfo.offset.x, y: panInfo.offset.y })
                    },
                    onEnd: () => {
                        this.style.set({ x: 0, y: 0 })
                    }
                })
            }
        )
    }
}