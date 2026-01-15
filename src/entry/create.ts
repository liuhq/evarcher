import { createContext } from '../data/context.ts'
import { ev_ } from '../data/event.ts'
import { ExtendMap } from '../data/ex_map.ts'
import { ns_ } from '../data/namespace.ts'
import type { EventCollection } from '../data/types.ts'
import type { HandlerUnit } from '../data/unit.ts'
import type { EvarcherReturn } from './create.type.ts'
import { merge_option } from './option.ts'
import type { EvarcherOption } from './option.ts'

export const createEvarcher = <C extends EventCollection>(
    option?: EvarcherOption,
): EvarcherReturn<C> => {
    const opt = merge_option(option)
    const default_namespace = opt.defaultNamespace
    const default_ev_map = new ExtendMap<keyof C, HandlerUnit<C, any>[]>()
    const default_item = [[default_namespace, default_ev_map]] as const

    const ctx = createContext<C>(default_item, opt)

    const ns: EvarcherReturn<C>['ns'] = (namespace) => ns_(ctx, namespace)
    const ev: EvarcherReturn<C>['ev'] = (event) =>
        ev_(ctx, default_namespace, event)

    return {
        ns,
        ev,
        get DEFAULT_NAMESPACE() {
            return default_namespace
        },
    }
}
