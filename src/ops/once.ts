import type { Context, EventHandlerMap, NamespaceMap } from '../data/context'
import { ExtendMap } from '../data/ex_map'
import type { HandlerUnit } from '../data/unit'

export const once_ = <E, K extends keyof E>(
    { trace: { info }, ns_map }: Context<E>,
    namespace: string,
    ev_map: EventHandlerMap<E> | undefined,
    event: K,
    units: HandlerUnit<E, K>[] | undefined,
    unit: HandlerUnit<E, K>,
): NamespaceMap<E> => {
    const op = 'once'
    const new_ns_map = ns_map.clone()

    info({ layer: 'event', op, message: `${event as string} <- ${unit.id}` })

    const _ev_map = ev_map ?? new ExtendMap()
    const new_units = units ?? []

    const new_ev_map = _ev_map.set(event, [...new_units, unit])
    new_ns_map.set(namespace, new_ev_map)

    return new_ns_map
}
