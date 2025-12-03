import type { Context, EventHandlerMap, NamespaceMap } from '../data/context'
import type { HandlerUnit } from '../data/unit'
import type { Handler } from '../main'
import { units_updater_, type UpdaterProcessor } from '../utils/units_updater'

export const disable_ = <E, K extends keyof E>(
    { trace: { warn, error }, ns_map }: Context<E>,
    namespace: string,
    ev_map: EventHandlerMap<E> | undefined,
    event: K,
    units: HandlerUnit<E, K>[] | undefined,
    handler: Handler<E[K]> | undefined,
): NamespaceMap<E> => {
    const op = 'disable'
    const event_str = String(event)
    const new_ns_map = ns_map.clone()

    if (!ev_map) {
        error({ layer: 'namespace', op, message: `${namespace} not found` })
        return new_ns_map
    }

    if (!units) {
        error({ layer: 'event', op, message: `${event_str} not found` })
        return new_ns_map
    }

    const units_updater = units_updater_(units)
    const processer: UpdaterProcessor = () => ({ enabled: false })

    if (!handler) {
        warn({ layer: 'event', op, message: `${event_str} all disable` })
        const updated = units_updater.at('*').by(processer)
        ev_map.set(event, updated)
        new_ns_map.set(namespace, ev_map)
        return new_ns_map
    }

    const updated = units_updater.at(['handler', handler]).by(processer)
    ev_map.set(event, updated)
    new_ns_map.set(namespace, ev_map)
    return new_ns_map
}
