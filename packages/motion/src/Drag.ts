import styler, { Styler } from 'stylefire';
import { addPointerEvent } from './events';
import { Point } from './geometry';
import { PanInfo, PanSession } from './PanSession';

export class Drag {
    public style: Styler;
    private originPoint: Point = { x: 0, y: 0 }
    constructor(private props: { element: Element, direction?: 'x' | 'y' }) {
        this.style = styler(props.element);
        addPointerEvent(
            props.element,
            "pointerdown",
            (event) => {
                new PanSession(event, {
                    onStart: (e, panInfo) => {
                        this.originPoint.x = this.style.get('x');
                        this.originPoint.y = this.style.get('y');
                        this.updatePosition(panInfo);
                    },
                    onMove: (e, panInfo) => {
                        this.updatePosition(panInfo);
                    },
                    onEnd: (e, panInfo) => {
                        this.updatePosition(panInfo);
                    }
                })
            }
        )
    }

    private updatePosition = (panInfo: PanInfo) => {
        if (this.props.direction === 'y') {
            this.style.set({ y: this.originPoint.y + panInfo.offset.y })
        } else if (this.props.direction === 'x') {
            this.style.set({ x: this.originPoint.x + panInfo.offset.x })
        } else {
            this.style.set({ x: this.originPoint.x + panInfo.offset.x, y: this.originPoint.y + panInfo.offset.y })
        }
    }
}