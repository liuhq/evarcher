export type Counter = {
    get: () => number
    peek: () => number
}

export const createCounter = (initial_value?: number): Counter => {
    let count = initial_value ?? 0
    return {
        get: () => count++,
        peek: () => count,
    }
}
