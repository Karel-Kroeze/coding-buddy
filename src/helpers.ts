export function runif( max: number, min: number = 0 ): number {
    let range = max - min;
    return Math.round( Math.random() * range + min );
}

export function randomElement<T>( array: T[] ): T {
    return array[runif(array.length-1)];
}