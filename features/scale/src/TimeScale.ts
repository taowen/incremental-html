import { Feature } from "@incremental-html/reactivity";
import { scaleTime } from 'd3-scale';

export class TimeScale extends Feature<{ ticksInterval?: 'month' }> {
    public readonly scale = scaleTime();
}