import { Observed } from "@incremental-html/headlessui";
import { closestFeature, Feature } from "@incremental-html/reactivity";
import { extent } from "d3-array";
import { scaleTime } from 'd3-scale';
import * as d3Time from 'd3-time';

export class TimeScale extends Feature<{ data: Date[], ticksInterval: string, nice?: boolean, range?: [number, number], paddingLeft?: number, paddingRight?: number }> {

    private _1 = this.effect(() => {
        if (this.parent) {
            this.element.setAttribute('width', this.parent.width);
        }
    })

    public readonly _scale = this.create(() => {
        let scale = scaleTime().domain(extent(this.props.data) as [Date, Date]);
        if (this.props.nice) {
            scale = scale.nice(this.interval)
        }
        return scale;
    });

    public scale(v: any) {
        this.range; // subscribe
        return this._scale(v);
    }

    private _2 = this.effect(() => {
        this._scale.range(this.range);
    })

    public get range(): [number, number] {
        if (this.props.range) {
            return this.props.range;
        }
        if (!this.parent) {
            throw new Error('use:observed not found, can not determine TimeScale range');
        }
        return [this.props.paddingLeft || 0, this.parent.width - (this.props.paddingLeft || 0) - (this.props.paddingRight || 0)];
    }

    private get parent() {
        return closestFeature(this.element, Observed);
    }

    public get ticks() {
        return this._scale.ticks(this.interval);
    }

    public get oneTickLength() {
        return this.scale(this.ticks[1]) - this.scale(this.ticks[0]);
    }

    public get scaledData() {
        return this.props.data.map(d => this.scale(d));
    }

    private get interval(): d3Time.CountableTimeInterval {
        const interval = Reflect.get(d3Time, this.props.ticksInterval);
        if (!interval?.count) {
            throw new Error('invalid interval: ' + this.props.ticksInterval);
        }
        return interval;
    }

    protected isStringProp(propName: string): boolean {
        return propName === 'ticksInterval'
    }

    public locateTick(date: Date): number {
        const dateTime = date.getTime();
        for (const [i, tick] of this.ticks.entries()) {
            const nextTick = this.ticks[i + 1];
            if (!nextTick) {
                break;
            }
            if (dateTime >= tick.getTime() && dateTime < nextTick.getTime()) {
                return i;
            }
        }
        return -1;
    }
}