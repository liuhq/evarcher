import type { EventCollection } from '../data/types'
import type { HandlerUnit } from '../data/unit'
import type { Unregister } from '../entry/create.type'
import { unregister_once_ } from './unregister'

export const collect_parallel_ = async <
    C extends EventCollection,
    K extends keyof C,
>(
    units: HandlerUnit<C, any>[],
    payload: C[K]['payload'] extends void | undefined ? [payload?: undefined]
        : [payload: C[K]['payload']],
) => {
    const result_container = await Promise.all(
        units.map((u) => Promise.resolve(u.handler(...payload))),
    )

    return {
        result_container,
        unregister_once: (unregister: Unregister<C, K>) =>
            unregister_once_(unregister, units),
    }
}

export const collect_serial_ = async <
    C extends EventCollection,
    K extends keyof C,
>(
    units: HandlerUnit<C, any>[],
    payload: C[K]['payload'] extends void | undefined ? [payload?: undefined]
        : [payload: C[K]['payload']],
) => {
    const result_container = []

    for (const h of units) {
        // oxlint-disable-next-line no-await-in-loop
        const await_result = await Promise.resolve(h.handler(...payload))
        result_container.push(await_result)
    }

    return {
        result_container,
        unregister_once: (unregister: Unregister<C, K>) =>
            unregister_once_(unregister, units),
    }
}
