import { LinearScale } from "../LinearScale";

test('generate ticks from data', () => {
    const scale = new LinearScale(document.createElement('svg'), () => ({
        ticksCount: 7,
        range: [0, 100],
        data: [
            100,
            90,
            577
        ],
    }));
    expect(scale.ticks).toEqual([
        100, 150, 200, 250,
        300, 350, 400, 450,
        500, 550
    ])
})