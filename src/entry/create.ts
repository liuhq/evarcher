import { createContext } from '../data/context'
import { ev_ } from '../data/event'
import { ExtendMap } from '../data/ex_map'
import { ns_ } from '../data/namespace'
import type { HandlerUnit } from '../data/unit'
import type { EvarcherReturn } from './create.type'
import { merge_option } from './option'
import type { EvarcherOption } from './option'

export const createEvarcher = <E>(
    option?: EvarcherOption,
): EvarcherReturn<E> => {
    const opt = merge_option(option)
    const default_namespace = opt.defaultNamespace
    const default_ev_map = new ExtendMap<keyof E, HandlerUnit<E, any>[]>()
    const default_item = [[default_namespace, default_ev_map]] as const

    const ctx = createContext<E>(default_item, opt)

    const ns: EvarcherReturn<E>['ns'] = (namespace) => ns_(ctx, namespace)
    const ev: EvarcherReturn<E>['ev'] = (event) =>
        ev_(ctx, default_namespace, event)

    return {
        ns,
        ev,
        get DEFAULT_NAMESPACE() {
            return default_namespace
        },
    }
}
