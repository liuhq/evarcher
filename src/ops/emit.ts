import type { Context, EventHandlerMap } from '../data/context'
import type { HandlerUnit } from '../data/unit'
import type { Unregister } from '../entry/create.type'

export const emit_ = <E, K extends keyof E>(
    { trace, ..._ }: Context<E>,
    actions: { unregister: Unregister<E, K> },
    namespace: string,
    ev_map: EventHandlerMap<E> | undefined,
    event: K,
    units: HandlerUnit<E, K>[] | undefined,
    payload: E[K] extends void | undefined ? [payload?: undefined]
        : [payload: E[K]],
) => {
    if (!ev_map) {
        trace('ERROR', `(emit)namespace#${namespace}: not found`)
        return
    }

    if (!units) {
        trace('ERROR', `(emit)event#${String(event)}: not found`)
        return
    }

    const enabled_units = units
        .filter((unit) => unit.enabled)
        .map((unit) => ({
            handler: unit.handler,
            once: unit.once,
        }))

    for (const h of enabled_units) {
        h.handler(...payload)
        if (h.once) actions.unregister(h.handler)
    }
}
