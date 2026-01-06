import type { Context, NamespaceMap } from '../data/context'
import { ExtendMap } from '../data/ex_map'
import type { EventCollection, GetEvMap } from '../data/types'
import type { HandlerUnit } from '../data/unit'

export const once_ = <C extends EventCollection, K extends keyof C>(
    { trace: { info }, ns_map }: Context<C>,
    namespace: string,
    event: K,
    get_ev_map: GetEvMap<C>,
    unit: HandlerUnit<C, K>,
): NamespaceMap<C> => {
    const op = 'once'
    const new_ns_map = ns_map.clone()
    const ev_map = get_ev_map()
    const units = ev_map?.get(event)

    info({ layer: 'event', op, message: `${event as string} <- ${unit.id}` })

    const _ev_map = ev_map ?? new ExtendMap()
    const new_units = units ?? []

    const new_ev_map = _ev_map.set(event, [...new_units, unit])
    new_ns_map.set(namespace, new_ev_map)

    return new_ns_map
}
