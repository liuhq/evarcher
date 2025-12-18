import type { Context, NamespaceMap } from '../data/context'
import type { GetEvMap } from '../data/types'
import type { Handler, HandlerUnit } from '../data/unit'
import { units_updater_, type UpdaterProcessor } from '../utils/units_updater'

type ConditionReturn<E, K extends keyof E> = (
    handler_or_id: Handler<E[K]> | string | undefined,
) => HandlerUnit<E, K>[]

const condition_ = <E, K extends keyof E>(
    units: HandlerUnit<E, K>[],
    trace: (id: string) => void,
): ConditionReturn<E, K> => {
    const updater = units_updater_(units)
    const processor: UpdaterProcessor = (u) => {
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

export const disable_ = <E, K extends keyof E>(
    { trace: { info, warn, error }, ns_map }: Context<E>,
    namespace: string,
    event: K,
    get_ev_map: GetEvMap<E>,
    handler_or_id: Handler<E[K]> | string | undefined,
): NamespaceMap<E> => {
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
