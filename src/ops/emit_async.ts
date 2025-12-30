import type { Context } from '../data/context'
import type { GetEvMap } from '../data/types'
import type { HandlerUnit } from '../data/unit'
import type { Unregister } from '../entry/create.type'

const unregister_once_ = <E, K extends keyof E>(
    unregister: Unregister<E, K>,
    units: HandlerUnit<E, any>[],
) => {
    const once_units = units.filter((u) => u.once)
    for (const unit of once_units) {
        unregister(unit.id)
    }
}

const emit_parallel_ = async <E, K extends keyof E>(
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

const emit_serial_ = async <E, K extends keyof E>(
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

export const emit_async_ = <E, K extends keyof E>(
    { trace: { info, error } }: Context<E>,
    namespace: string,
    event: K,
    get_ev_map: GetEvMap<E>,
) => {
    const op = 'emit'
    const ev_map = get_ev_map()

    if (!ev_map) {
        error({ layer: 'namespace', op, message: `${namespace} not found` })
        return
    }

    const units = ev_map?.get(event)

    if (!units) {
        error({ layer: 'event', op, message: `${event as string} not found` })
        return
    }

    const enabled_units = units
        .filter((unit) => unit.enabled)

    const list_run_unit = enabled_units.map((u) => u.id).reduce(
        (acc, id) => acc.concat('\n', '\t', id),
        '',
    )

    info({
        layer: 'event',
        op,
        message:
            `${event as string} <-run[${enabled_units.length}]-${list_run_unit}`,
    })

    return {
        parallel: (
            payload: E[K] extends void | undefined ? [payload?: undefined]
                : [payload: E[K]],
        ) => emit_parallel_(enabled_units, payload),
        serial: (
            payload: E[K] extends void | undefined ? [payload?: undefined]
                : [payload: E[K]],
        ) => emit_serial_(enabled_units, payload),
    }
}
