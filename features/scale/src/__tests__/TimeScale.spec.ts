import { utcMonth } from 'd3-time';
import { TimeScale } from "../TimeScale";

test('generate ticks from data', () => {
    const scale = new TimeScale(document.createElement('svg'), () => ({
        interval: utcMonth,
        data: [
            new Date('2014-02-11T11:30:30'),
            new Date('2014-01-11T11:30:30'),
            new Date('2015-06-11T11:30:30')
        ],
    }));
    expect(scale.ticks.length).toBe(19);
    expect(scale.ticks[0]).toEqual(new Date('2014-01-01T00:00:00.000Z'));
    expect(scale.ticks[18]).toEqual(new Date('2015-07-01T00:00:00.000Z'));
})