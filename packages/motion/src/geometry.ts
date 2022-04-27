export interface Point {
    x: number
    y: number
}


export type TransformPoint = (point: Point) => Point