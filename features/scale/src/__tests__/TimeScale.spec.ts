import { TimeScale } from "../TimeScale"
import * as dateFns from 'date-fns';

test('scale', () => {
    const scale = new TimeScale(document.createElement('svg'), () => ({ ticksInterval: 'month' }));
    console.log(scale.scale(dateFns.parseISO('2014-02-11T11:30:30')));
})