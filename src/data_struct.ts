import type { Handler } from './types'

export interface HandlerUnit<E, K extends keyof E> {
    callback: Handler<E[K]>
    enabled: boolean
    namespace: string
    priority: number
    once: boolean
}

export class EvMap<E> {
    #map: Map<keyof E, HandlerUnit<E, any>[]>

    constructor() {
        this.#map = new Map()
    }

    get<K extends keyof E>(key: K): HandlerUnit<E, K>[] | undefined {
        return this.#map.get(key)
    }

    get_or<K extends keyof E>(
        key: K,
        initializer: HandlerUnit<E, K>[],
    ): HandlerUnit<E, K>[] {
        if (this.#map.get(key) === undefined) this.#map.set(key, initializer)

        return this.#map.get(key)!
    }

    set<K extends keyof E>(key: K, value: HandlerUnit<E, K>[]) {
        this.#map.set(key, value)
    }

    has<K extends keyof E>(key: K): boolean {
        return this.#map.has(key)
    }
}
