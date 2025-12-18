import type { Context } from '../data/context'
import type { GetEvMap } from '../data/types'
import type { Unregister } from '../entry/create.type'

export const emit_ = <E, K extends keyof E>(
    { trace: { info, error } }: Context<E>,
    actions: { unregister: Unregister<E, K> },
    namespace: string,
    event: K,
    get_ev_map: GetEvMap<E>,
    payload: E[K] extends void | undefined ? [payload?: undefined]
        : [payload: E[K]],
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

    for (const h of enabled_units) {
        h.handler(...payload)
        if (h.once) actions.unregister(h.handler)
    }
}
