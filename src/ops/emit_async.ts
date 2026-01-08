import type { EventCollection } from '../data/types'
import type { HandlerUnit } from '../data/unit'
import type { Unregister } from '../entry/create.type'
import type { UnitErrorFn } from '../entry/error'
import { unregister_once_ } from './unregister'

export const emit_parallel_ = async <
    C extends EventCollection,
    K extends keyof C,
>(
    units: HandlerUnit<C, any>[],
    payload: C[K]['payload'] extends void | undefined ? [payload?: undefined]
        : [payload: C[K]['payload']],
    unit_error: UnitErrorFn,
) => {
    await Promise.all(units.map((u) =>
        Promise
            .resolve(u.handler(...payload))
            .catch((reason) => unit_error(u.id, reason))
    ))
    return {
        unregister_once: (unregister: Unregister<C, K>) =>
            unregister_once_(unregister, units),
    }
}

export const emit_serial_ = async <
    C extends EventCollection,
    K extends keyof C,
>(
    units: HandlerUnit<C, any>[],
    payload: C[K]['payload'] extends void | undefined ? [payload?: undefined]
        : [payload: C[K]['payload']],
    unit_error: UnitErrorFn,
) => {
    for (const h of units) {
        // oxlint-disable-next-line no-await-in-loop
        await Promise
            .resolve(h.handler(...payload))
            .catch((reason) => unit_error(h.id, reason))
    }
    return {
        unregister_once: (unregister: Unregister<C, K>) =>
            unregister_once_(unregister, units),
    }
}
