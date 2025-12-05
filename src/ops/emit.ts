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
    const event_str = String(event)

    if (!ev_map) {
        error({ layer: 'namespace', op, message: `${namespace} not found` })
        return
    }

    if (!units) {
        error({ layer: 'event', op, message: `${event_str} not found` })
        return
    }

    const enabled_units = units
        .filter((unit) => unit.enabled)
        .map((unit) => ({
            handler: unit.handler,
            once: unit.once,
        }))

    info({
        layer: 'event',
        op,
        message: `${event_str} runs ${enabled_units.length} handlers`,
    })

    for (const h of enabled_units) {
        h.handler(...payload)
        if (h.once) actions.unregister(h.handler)
    }
}
