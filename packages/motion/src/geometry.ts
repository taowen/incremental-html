export interface Point {
    x: number
    y: number
}

export type TransformPoint = (point: Point) => Point

export interface BoundingBox {
    top: number
    right: number
    bottom: number
    left: number
}