import type { Context, EventHandlerMap, NamespaceMap } from '../data/context'
import type { HandlerUnit } from '../data/unit'
import type { Handler } from '../main'
import { units_updater_, type UpdaterProcessor } from '../utils/units_updater'

export const disable_ = <E, K extends keyof E>(
    { trace, ns_map, ..._ }: Context<E>,
    namespace: string,
    ev_map: EventHandlerMap<E> | undefined,
    event: K,
    units: HandlerUnit<E, K>[] | undefined,
    handler: Handler<E[K]> | undefined,
): NamespaceMap<E> => {
    const new_ns_map = ns_map.clone()

    if (!ev_map) {
        trace('ERROR', `(disable)namespace#${namespace}: not found`)
        return new_ns_map
    }

    if (!units) {
        trace('ERROR', `(disable)event#${String(event)}: not found`)
        return new_ns_map
    }

    const units_updater = units_updater_(units)
    const processer: UpdaterProcessor = () => ({ enabled: false })

    if (!handler) {
        trace('WARN', `(disable)event#${String(event)}: ALL DISABLE`)
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
