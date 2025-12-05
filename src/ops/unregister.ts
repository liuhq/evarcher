import type { Context, EventHandlerMap, NamespaceMap } from '../data/context'
import type { Handler, HandlerUnit } from '../data/unit'

export const unregister_ = <E, K extends keyof E>(
    { trace: { warn, error }, ns_map, ..._ }: Context<E>,
    namespace: string,
    ev_map: EventHandlerMap<E> | undefined,
    event: K,
    units: HandlerUnit<E, K>[] | undefined,
    handler: Handler<E[K]> | undefined,
): NamespaceMap<E> => {
    const op = 'unregister'
    const new_ns_map = ns_map.clone()

    if (!ev_map) {
        error({ layer: 'namespace', op, message: `${namespace} not found` })
        return new_ns_map
    }

    if (!units) {
        error({ layer: 'event', op, message: `${event as string} not found` })
        return new_ns_map
    }

    if (!handler) {
        warn({
            layer: 'event',
            op,
            message: `${event as string} all unregister`,
        })
        ev_map.set(event, [])
        new_ns_map.set(namespace, ev_map)
        return new_ns_map
    }

    const updated = units.filter((unit) => unit.handler !== handler)
    ev_map.set(event, updated)
    new_ns_map.set(namespace, ev_map)
    return new_ns_map
}
