import type { Context, NamespaceMap } from '../data/context'
import type { GetEvMap } from '../data/types'
import type { Handler, HandlerUnit } from '../data/unit'

type ConditionReturn<E, K extends keyof E> = (
    units: HandlerUnit<E, K>[],
    trace: (id: string) => void,
) => HandlerUnit<E, K>[]

const condition_ = <E, K extends keyof E>(
    handler_or_id: Handler<E[K]> | string,
): ConditionReturn<E, K> => {
    switch (typeof handler_or_id) {
        case 'function':
            return (units, trace) =>
                units.filter((unit) => {
                    const retain = unit.handler !== handler_or_id
                    if (!retain) trace(unit.id)
                    return retain
                })
        case 'string':
            return (units, trace) =>
                units.filter((unit) => {
                    const retain = unit.id !== handler_or_id
                    if (!retain) trace(unit.id)
                    return retain
                })
        default:
            return (units) => units
    }
}

export const unregister_ = <E, K extends keyof E>(
    { trace: { info, warn, error }, ns_map, ..._ }: Context<E>,
    namespace: string,
    event: K,
    get_ev_map: GetEvMap<E>,
    handler_or_id: Handler<E[K]> | string | undefined,
): NamespaceMap<E> => {
    const op = 'unregister'
    const new_ns_map = ns_map.clone()
    const ev_map = get_ev_map()

    if (!ev_map) {
        error({ layer: 'namespace', op, message: `${namespace} not found` })
        return new_ns_map
    }

    const units = ev_map?.get(event)

    if (!units) {
        error({ layer: 'event', op, message: `${event as string} not found` })
        return new_ns_map
    }

    if (!handler_or_id) {
        warn({
            layer: 'event',
            op,
            message: `${event as string} -|> ALL`,
        })
        ev_map.set(event, [])
        new_ns_map.set(namespace, ev_map)
        return new_ns_map
    }

    const updated = condition_(handler_or_id)(units, (id) =>
        info({
            layer: 'event',
            op,
            message: `${event as string} -> ${id}`,
        }))

    ev_map.set(event, updated)
    new_ns_map.set(namespace, ev_map)
    return new_ns_map
}
