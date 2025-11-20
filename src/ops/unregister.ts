import type { Context, EventHandlerMap, NamespaceMap } from '../data/context'
import type { Handler, HandlerUnit } from '../data/unit'

export const unregister_ = <E, K extends keyof E>(
    { trace, ns_map, ..._ }: Context<E>,
    namespace: string,
    ev_map: EventHandlerMap<E> | undefined,
    event: K,
    units: HandlerUnit<E, K>[] | undefined,
    handler: Handler<E[K]> | undefined,
): NamespaceMap<E> => {
    const new_ns_map = ns_map.clone()

    if (!ev_map) {
        trace('ERROR', `(unregister)namespace#${namespace}: not found`)
        return new_ns_map
    }

    if (!units) {
        trace('ERROR', `(unregister)event#${String(event)}: not found`)
        return new_ns_map
    }

    if (!handler) {
        ev_map.set(event, [])
        new_ns_map.set(namespace, ev_map)
        return new_ns_map
    }

    const updated = units.filter((unit) => unit.handler !== handler)
    ev_map.set(event, updated)
    new_ns_map.set(namespace, ev_map)
    return new_ns_map
}
