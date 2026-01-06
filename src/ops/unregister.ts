import type { Context, NamespaceMap } from '../data/context'
import type { EventCollection, GetEvMap } from '../data/types'
import type { Handler, HandlerUnit } from '../data/unit'
import type { Unregister } from '../entry/create.type'

type ConditionReturn<C extends EventCollection, K extends keyof C> = (
    units: HandlerUnit<C, K>[],
    trace: (id: string) => void,
) => HandlerUnit<C, K>[]

const condition_ = <C extends EventCollection, K extends keyof C>(
    handler_or_id: Handler<C[K]> | string,
): ConditionReturn<C, K> => {
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

export const unregister_ = <C extends EventCollection, K extends keyof C>(
    { trace: { info, warn, error }, ns_map, ..._ }: Context<C>,
    namespace: string,
    event: K,
    get_ev_map: GetEvMap<C>,
    handler_or_id: Handler<C[K]> | string | undefined,
): NamespaceMap<C> => {
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

export const unregister_once_ = <C extends EventCollection, K extends keyof C>(
    unregister: Unregister<C, K>,
    units: HandlerUnit<C, any>[],
) => {
    const once_units = units.filter((u) => u.once)
    for (const unit of once_units) {
        unregister(unit.id)
    }
}
