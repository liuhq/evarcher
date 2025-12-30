import { DEFAULT_PRIORITY } from '../constants'
import type {
    Disable,
    Emit,
    Enable,
    Once,
    Operator,
    Parallel,
    Register,
    Serial,
    Unregister,
} from '../entry/create.type'
import { disable_ } from '../ops/disable'
import { emit_ } from '../ops/emit'
import { emit_async_ } from '../ops/emit_async'
import { enable_ } from '../ops/enable'
import { once_ } from '../ops/once'
import { register_ } from '../ops/register'
import { unregister_ } from '../ops/unregister'
import type { Context } from './context'
import { unit_ } from './unit'

export const ev_ = <E, K extends keyof E>(
    ctx: Context<E>,
    namespace: string,
    event: K,
): Operator<E, K> => {
    const get_ev_map = () => ctx.ns_map.get(namespace)

    const enabled = ctx.opt.defaultEnabled
    const priority = DEFAULT_PRIORITY

    const enable: Enable<E, K> = (handler_or_id) => {
        ctx.ns_map = enable_(ctx, namespace, event, get_ev_map, handler_or_id)
    }

    const disable: Disable<E, K> = (handler_or_id) => {
        ctx.ns_map = disable_(ctx, namespace, event, get_ev_map, handler_or_id)
    }

    const register: Register<E, K> = (handler) => {
        const once = false
        const id_number = ctx.global_counter.get()
        const id = `${namespace}:${event as string}:${id_number}`
        const reg_unit_ = unit_<E, K>({ enabled, priority, once })
        ctx.ns_map = register_(
            ctx,
            namespace,
            event,
            get_ev_map,
            reg_unit_(id, handler),
        )

        return {
            get id() {
                return id
            },
            enable: () => enable(handler),
            disable: () => disable(handler),
        }
    }

    const once: Once<E, K> = (handler) => {
        const once = true
        const id_number = ctx.global_counter.get()
        const id = `${namespace}:${event as string}:${id_number}`
        const once_unit_ = unit_<E, K>({ enabled, priority, once })
        ctx.ns_map = once_(
            ctx,
            namespace,
            event,
            get_ev_map,
            once_unit_(id, handler),
        )

        return {
            get id() {
                return id
            },
            enable: () => enable(handler),
            disable: () => disable(handler),
        }
    }

    const unregister: Unregister<E, K> = (handler_or_id) => {
        ctx.ns_map = unregister_(
            ctx,
            namespace,
            event,
            get_ev_map,
            handler_or_id,
        )
    }

    const emit: Emit<E, K> = (...payload) => {
        emit_(ctx, { unregister }, namespace, event, get_ev_map, payload)
    }

    const parallel: Parallel<E, K> = {
        emit: async (...payload) => {
            const emit_async = emit_async_(ctx, namespace, event, get_ev_map)
            if (!emit_async) return
            const resolved = await emit_async.parallel(payload)
            resolved.unregister_once(unregister)
        },
    }

    const serial: Serial<E, K> = {
        emit: async (...payload) => {
            const emit_async = emit_async_(ctx, namespace, event, get_ev_map)
            if (!emit_async) return
            const resolved = await emit_async.serial(payload)
            resolved.unregister_once(unregister)
        },
    }

    return {
        enable,
        disable,
        register,
        once,
        unregister,
        emit,
        parallel,
        serial,
    }
}
