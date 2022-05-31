import { Line } from "../Line";

test('generate ticks from data', () => {
    const line = new Line(document.createElement('path'), () => ({
        x: [100, 200],
        y: [22, 33]
    }));
    expect((line.svgElement as SVGPathElement).getAttribute('d')).toBe('M100,22L200,33')
})