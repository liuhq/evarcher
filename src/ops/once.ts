import { DEFAULT_PRIORITY } from '../constants'
import type { Context, EventHandlerMap, NamespaceMap } from '../data/context'
import { ExtendMap } from '../data/ex_map'
import type { Handler, HandlerUnit } from '../data/unit'

export const once_ = <E, K extends keyof E>(
    { trace, ns_map, opt, global_counter }: Context<E>,
    namespace: string,
    ev_map: EventHandlerMap<E> | undefined,
    event: K,
    units: HandlerUnit<E, K>[] | undefined,
    handler: Handler<E[K]>,
): NamespaceMap<E> => {
    const new_ns_map = ns_map.clone()
    const unit: HandlerUnit<E, K> = {
        handler,
        token: `${namespace}:${String(event)}:${global_counter.get()}`,
        enabled: opt.defaultEnabled,
        priority: DEFAULT_PRIORITY,
        once: true,
    }

    trace('INFO', `(once)event#${String(event)}`)

    const _ev_map = ev_map ?? new ExtendMap()
    const new_units = units ?? []

    const new_ev_map = _ev_map.set(event, [...new_units, unit])
    new_ns_map.set(namespace, new_ev_map)

    return new_ns_map
}
