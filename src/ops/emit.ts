import type { Context, EventHandlerMap } from '../data/context'
import type { HandlerUnit } from '../data/unit'
import type { Unregister } from '../entry/create.type'

export const emit_ = <E, K extends keyof E>(
    { trace: { info, error } }: Context<E>,
    actions: { unregister: Unregister<E, K> },
    namespace: string,
    ev_map: EventHandlerMap<E> | undefined,
    event: K,
    units: HandlerUnit<E, K>[] | undefined,
    payload: E[K] extends void | undefined ? [payload?: undefined]
        : [payload: E[K]],
) => {
    const op = 'emit'

    if (!ev_map) {
        error({ layer: 'namespace', op, message: `${namespace} not found` })
        return
    }

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

    for (const h of enabled_units) {
        h.handler(...payload)
        if (h.once) actions.unregister(h.handler)
    }
}
