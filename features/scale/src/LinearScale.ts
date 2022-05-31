import { Observed } from '@incremental-html/headlessui';
import { closestFeature, Feature } from '@incremental-html/reactivity';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';

export class LinearScale extends Feature<{ data: number[], ticksCount: number, range?: [number, number], paddingTop?: number, paddingBottom?: number }> {

    private _1 = this.effect(() => {
        if (this.parent) {
            this.element.setAttribute('height', this.parent.height);
        }
    })

    public _scale = scaleLinear().domain(extent(this.props.data) as [number, number]);

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
            throw new Error('use:observed not found, can not determine LinearScale range');
        }
        return [this.parent.height - (this.props.paddingTop || 0) - (this.props.paddingBottom || 0), this.props.paddingTop || 0];
    }

    private get parent() {
        return closestFeature(this.element, Observed);
    }

    public get ticks() {
        return this._scale.ticks(this.props.ticksCount)
    }
}