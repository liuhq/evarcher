import type { Context, NamespaceMap } from '../data/context'
import type { EventCollection, GetEvMap } from '../data/types'
import type { Handler, HandlerUnit } from '../data/unit'
import { units_updater_, type UpdaterProcessor } from '../utils/units_updater'

type ConditionReturn<C extends EventCollection, K extends keyof C> = (
    handler_or_id: Handler<C[K]> | string | undefined,
) => HandlerUnit<C, K>[]

const condition_ = <C extends EventCollection, K extends keyof C>(
    units: HandlerUnit<C, K>[],
    trace: (id: string) => void,
): ConditionReturn<C, K> => {
    const updater = units_updater_<C>(units)
    const processor: UpdaterProcessor<C> = (u) => {
        trace(u.id)
        return { enabled: false }
    }

    return (handler_or_id) => {
        switch (typeof handler_or_id) {
            case 'function':
                return updater.at(['handler', handler_or_id]).by(processor)
            case 'string':
                return updater.at(['id', handler_or_id]).by(processor)
            case 'undefined':
                return updater.at('*').by(processor)
            default:
                return units
        }
    }
}

export const disable_ = <C extends EventCollection, K extends keyof C>(
    { trace: { info, warn, error }, ns_map }: Context<C>,
    namespace: string,
    event: K,
    get_ev_map: GetEvMap<C>,
    handler_or_id: Handler<C[K]> | string | undefined,
): NamespaceMap<C> => {
    const op = 'disable'
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

    const condition = condition_(
        units,
        (id) =>
            info({
                layer: 'event',
                op,
                message: `${event as string} <-off- ${id}`,
            }),
    )

    if (!handler_or_id) {
        warn({
            layer: 'event',
            op,
            message: `${event as string} <-off- ALL`,
        })
    }

    const updated = condition(handler_or_id)
    ev_map.set(event, updated)
    new_ns_map.set(namespace, ev_map)
    return new_ns_map
}
