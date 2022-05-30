import { Feature } from "@incremental-html/reactivity";
import { extent } from "d3-array";
import { scaleTime } from 'd3-scale';
import { CountableTimeInterval } from 'd3-time';

export class TimeScale extends Feature<{ data: Date[], interval?: CountableTimeInterval }> {
    public readonly scale = this.create(() => {
        let scale = scaleTime().domain(extent(this.props.data) as [Date, Date]);
        if (this.props.interval) {
            scale = scale.nice(this.props.interval)
        }
        return scale;
    });

    public get ticks() {
        return this.scale.ticks(this.props.interval!);
    }
}