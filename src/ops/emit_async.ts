import type { HandlerUnit } from '../data/unit'
import type { Unregister } from '../entry/create.type'
import { unregister_once_ } from './unregister'

export const emit_parallel_ = async <E, K extends keyof E>(
    units: HandlerUnit<E, any>[],
    payload: E[K] extends void | undefined ? [payload?: undefined]
        : [payload: E[K]],
) => {
    await Promise.all(units.map((u) => Promise.resolve(u.handler(...payload))))
    return {
        unregister_once: (unregister: Unregister<E, K>) =>
            unregister_once_(unregister, units),
    }
}

export const emit_serial_ = async <E, K extends keyof E>(
    units: HandlerUnit<E, any>[],
    payload: E[K] extends void | undefined ? [payload?: undefined]
        : [payload: E[K]],
) => {
    for (const h of units) {
        // oxlint-disable-next-line no-await-in-loop
        await Promise.resolve(h.handler(...payload))
    }
    return {
        unregister_once: (unregister: Unregister<E, K>) =>
            unregister_once_(unregister, units),
    }
}
