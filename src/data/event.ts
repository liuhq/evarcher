import type {
    Disable,
    Emit,
    Enable,
    Once,
    Operator,
    Register,
    Unregister,
} from '../entry/create.type'
import { disable_ } from '../ops/disable'
import { emit_ } from '../ops/emit'
import { enable_ } from '../ops/enable'
import { once_ } from '../ops/once'
import { register_ } from '../ops/register'
import { unregister_ } from '../ops/unregister'
import type { Context } from './context'
import type { GetEvMap } from './types'

export const ev_ = <E, K extends keyof E>(
    ctx: Context<E>,
    namespace: string,
    get_ev_map: GetEvMap<E>,
    event: K,
): Operator<E, K> => {
    const ev_map = get_ev_map()
    const units = ev_map?.get(event)

    const enable: Enable<E, K> = (handler) => {
        ctx.ns_map = enable_(ctx, namespace, ev_map, event, units, handler)
    }

    const disable: Disable<E, K> = (handler) => {
        ctx.ns_map = disable_(ctx, namespace, ev_map, event, units, handler)
    }

    const register: Register<E, K> = (handler) => {
        ctx.ns_map = register_(ctx, namespace, ev_map, event, units, handler)

        return {
            enable: () => enable(handler),
            disable: () => disable(handler),
        }
    }

    const once: Once<E, K> = (handler) => {
        ctx.ns_map = once_(ctx, namespace, ev_map, event, units, handler)

        return {
            enable: () => enable(handler),
            disable: () => disable(handler),
        }
    }

    const unregister: Unregister<E, K> = (handler) => {
        ctx.ns_map = unregister_(ctx, namespace, ev_map, event, units, handler)
    }

    const emit: Emit<E, K> = (...payload) => {
        emit_(ctx, { unregister }, namespace, ev_map, event, units, payload)
    }

    return {
        enable,
        disable,
        register,
        once,
        unregister,
        emit,
    }
}
