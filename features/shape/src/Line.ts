import { Feature } from "@incremental-html/reactivity";
import * as d3Shape from 'd3-shape';

export class Line extends Feature<{ curve?: string, x: number[], y: number[]}> {
    private _ = this.effect(() => {
        if (this.props.x.length !== this.props.y.length) {
            throw new Error('x y array length mismatch');
        }
        const fakeData: any[] = [];
        for (let i = 0; i < this.props.x.length; i++) {
            fakeData.push(i);
        }
        let line = d3Shape.line();
        if (this.props.curve) {
            line = line.curve(Reflect.get(d3Shape, this.props.curve));
        }
        const d = line
            .x((i: any) => this.props.x[i])
            .y((i: any) => this.props.y[i])(fakeData)!;
        this.element.setAttribute('d', d);
    });
}