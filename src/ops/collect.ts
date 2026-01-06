import type { Context } from '../data/context'
import type { EventCollection, GetEvMap } from '../data/types'
import type { HandlerUnit } from '../data/unit'
import type { Unregister } from '../entry/create.type'
import { collect_parallel_, collect_serial_ } from './collect_async'
import { unregister_once_ } from './unregister'

const collect_sync_ = <C extends EventCollection, K extends keyof C>(
    units: HandlerUnit<C, any>[],
    payload: C[K]['payload'] extends void | undefined ? [payload?: undefined]
        : [payload: C[K]['payload']],
) => {
    const result_container: C[K]['result'][] = []

    for (const h of units) {
        // TODO: handle asynchronous errors
        const result = h.handler(...payload)
        result_container.push(result)
    }

    return {
        result_container,
        unregister_once: (unregister: Unregister<C, K>) =>
            unregister_once_(unregister, units),
    }
}

export const collect_ = <C extends EventCollection, K extends keyof C>(
    { trace: { info, error } }: Context<C>,
    namespace: string,
    event: K,
    get_ev_map: GetEvMap<C>,
) => {
    const op = 'collect'
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
        sync: (
            payload: C[K]['payload'] extends void | undefined
                ? [payload?: undefined]
                : [payload: C[K]['payload']],
        ) => collect_sync_(enabled_units, payload),
        parallel: (
            payload: C[K]['payload'] extends void | undefined
                ? [payload?: undefined]
                : [payload: C[K]['payload']],
        ) => collect_parallel_(enabled_units, payload),
        serial: (
            payload: C[K]['payload'] extends void | undefined
                ? [payload?: undefined]
                : [payload: C[K]['payload']],
        ) => collect_serial_(enabled_units, payload),
    }
}
