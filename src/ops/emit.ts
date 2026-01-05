import type { Context } from '../data/context'
import type { GetEvMap } from '../data/types'
import type { HandlerUnit } from '../data/unit'
import type { Unregister } from '../entry/create.type'
import { emit_parallel_, emit_serial_ } from './emit_async'
import { unregister_once_ } from './unregister'

const emit_sync_ = <E, K extends keyof E>(
    units: HandlerUnit<E, any>[],
    payload: E[K] extends void | undefined ? [payload?: undefined]
        : [payload: E[K]],
) => {
    for (const h of units) {
        // 避免同步运行因为异步 handler 导致中断
        // TODO: catch(handleError)
        Promise.resolve().then(() => h.handler(...payload))
    }

    return {
        unregister_once: (unregister: Unregister<E, K>) =>
            unregister_once_(unregister, units),
    }
}

export const emit_ = <E, K extends keyof E>(
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
        sync: (
            payload: E[K] extends void | undefined ? [payload?: undefined]
                : [payload: E[K]],
        ) => emit_sync_(enabled_units, payload),
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
