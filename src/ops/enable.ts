import type { Context, EventHandlerMap, NamespaceMap } from '../data/context'
import type { Handler, HandlerUnit } from '../data/unit'
import { units_updater_, type UpdaterProcessor } from '../utils/units_updater'

export const enable_ = <E, K extends keyof E>(
    { trace: { warn, error }, ns_map }: Context<E>,
    namespace: string,
    ev_map: EventHandlerMap<E> | undefined,
    event: K,
    units: HandlerUnit<E, K>[] | undefined,
    handler: Handler<E[K]> | undefined,
): NamespaceMap<E> => {
    const op = 'enable'
    const new_ns_map = ns_map.clone()

    if (!ev_map) {
        error({ layer: 'namespace', op, message: `${namespace} not found` })
        return new_ns_map
    }

    if (!units) {
        error({ layer: 'event', op, message: `${event as string} not found` })
        return new_ns_map
    }

    const units_updater = units_updater_(units)
    const processor: UpdaterProcessor = () => ({ enabled: true })

    if (!handler) {
        warn({ layer: 'event', op, message: `${event as string} all enable` })
        const updated = units_updater.at('*').by(processor)
        ev_map.set(event, updated)
        new_ns_map.set(namespace, ev_map)
        return new_ns_map
    }

    const updated = units_updater.at(['handler', handler]).by(processor)
    ev_map.set(event, updated)
    new_ns_map.set(namespace, ev_map)
    return new_ns_map
}
