import { Observed } from "@incremental-html/headlessui";
import { closestFeature, Feature } from "@incremental-html/reactivity";
import { extent } from "d3-array";
import { scaleTime } from 'd3-scale';
import * as d3Time from 'd3-time';

export class TimeScale extends Feature<{ data: Date[], ticksInterval: string, nice?: boolean, range?: [number, number], paddingLeft?: number, paddingRight?: number }> {

    private _ = this.effect(() => {
        if (this.parent) {
            this.element.setAttribute('width', this.parent.width);
        }
    })

    public readonly scale = this.create(() => {
        let scale = scaleTime().domain(extent(this.props.data) as [Date, Date]).range(this.range);
        if (this.props.nice) {
            scale = scale.nice(this.interval)
        }
        return scale;
    });

    public get range(): [number, number] {
        if (this.props.range) {
            return this.props.range;
        }
        if (!this.parent) {
            throw new Error('use:observed not found, can not determine TimeScale range');
        }
        return [0, this.parent.width - (this.props.paddingLeft || 0) - (this.props.paddingRight || 0)];
    }

    private get parent() {
        return closestFeature(this.element, Observed);
    }

    public get chart() {
        return {
            x: this.props.paddingLeft || 0,
            width: this.range[1]
        }
    }

    public get ticks() {
        return this.scale.ticks(this.interval);
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
}