/* eslint-disable @typescript-eslint/ban-types */

declare module '@saehrimnir/druidjs' {
    export function cosine(a: number[], b: number[]): number

    export function euclidean(a: number[], b: number[]): number

    export function euclidean_squared(a: number[], b: number[]): number

    export class Matrix {
        constructor(rows: number = null, cols: number = null, value: Function | string | number = 0)

        static from(a: Matrix | Array | number, type: "row" | "col" | "diag" = "row"): Matrix

        concat(a: Matrix, type: "horizontal" | "vertical" | "diag" = "horizontal"): Matrix

        get asArray(): number[][]

        get shape(): number[]
    }

    export class TSNE {
        constructor(x: Matrix, parameters?: {
            perplexity?: number,
            epsilon?: number,
            d?: number,
            metric?: Function | "precomputed",
            seed?: number
        })

        transform(iterations = 500): Matrix
    }
}