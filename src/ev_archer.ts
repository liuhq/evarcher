import { EvMap, type HandlerUnit } from './data_struct'
import type {
    EvarcherOption,
    EvarcherReturn,
    Handler,
    InternalEvOption,
} from './types'
import { createTrace, type Trace, updated_by_handler } from './utils'

const DEFAULT_NAMESPACE = 'GLOBAL'
const DEFAULT_PRIORITY = 0

const merge_option = <E, K extends keyof E>(
    option: EvarcherOption<E, K> | undefined,
): InternalEvOption<E, K> => {
    const default_option: InternalEvOption<E, K> = {
        id: 0,
        tag: false,
        defaultNamespace: DEFAULT_NAMESPACE,
        defaultEnabled: false,
        trace: false,
    }
    return Object.assign(default_option, option ?? {})
}

type Context<E, K extends keyof E> = {
    ev_map: EvMap<E>
    opt: InternalEvOption<E, K>
    trace: Trace
}

type Enable<E> = EvarcherReturn<E>['enable']
type Disable<E> = EvarcherReturn<E>['disable']
type Register<E> = EvarcherReturn<E>['register']
type Once<E> = EvarcherReturn<E>['once']
type Unregister<E> = EvarcherReturn<E>['unregister']
type Emit<E> = EvarcherReturn<E>['emit']

const enable_inner = <E, K extends keyof E>(
    ctx: Context<E, K>,
    event: K,
    handler?: Handler<E[K]>,
) => {
    if (!ctx.ev_map.has(event)) {
        ctx.trace('ERROR', `(enable)event#${String(event)}: not found`)
        return
    }

    if (!handler) {
        ctx.trace('WARN', `(enable)event#${String(event)}: ALL ENABLE`)
        ctx.ev_map.set(
            event,
            ctx.ev_map.get(event)!.map((unit) => ({
                ...unit,
                enabled: true,
            })),
        )
        return
    }

    ctx.ev_map.set(
        event,
        updated_by_handler(
            ctx.ev_map.get(event)!,
            handler,
            () => ({ enabled: true }),
        ),
    )
}

const disable_inner = <E, K extends keyof E>(
    ctx: Context<E, K>,
    event: K,
    handler?: Handler<E[K]>,
) => {
    if (!ctx.ev_map.has(event)) {
        ctx.trace('ERROR', `(disable)event#${String(event)}: not found`)
        return
    }

    if (!handler) {
        ctx.trace('WARN', `(disable)event#${String(event)}: ALL DISABLE`)
        ctx.ev_map.set(
            event,
            ctx.ev_map.get(event)!.map((unit) => ({ ...unit, enabled: false })),
        )
        return
    }

    ctx.ev_map.set(
        event,
        updated_by_handler(
            ctx.ev_map.get(event)!,
            handler,
            () => ({ enabled: false }),
        ),
    )
}

const register_inner = <E, K extends keyof E>(
    ctx: Context<E, K>,
    actions: {
        enable: Enable<E>
        disable: Disable<E>
    },
    event: K,
    handler: Handler<E[K]>,
) => {
    const unit: HandlerUnit<E, K> = {
        handler,
        enabled: ctx.opt.defaultEnabled,
        namespace: ctx.opt.defaultNamespace,
        priority: DEFAULT_PRIORITY,
        once: false,
    }

    ctx.trace('INFO', `(register)event#${String(event)}`)

    const units = ctx.ev_map.get_or(event, [])
    ctx.ev_map.set(event, [...units, unit])

    return {
        enable: () => actions.enable(event, handler),
        disable: () => actions.disable(event, handler),
    }
}

const once_inner = <E, K extends keyof E>(
    ctx: Context<E, K>,
    actions: {
        enable: Enable<E>
        disable: Disable<E>
    },
    event: K,
    handler: Handler<E[K]>,
) => {
    const unit: HandlerUnit<E, K> = {
        handler,
        enabled: ctx.opt.defaultEnabled,
        namespace: ctx.opt.defaultNamespace,
        priority: DEFAULT_PRIORITY,
        once: true,
    }

    ctx.trace('INFO', `(once)event#${String(event)}`)

    const units = ctx.ev_map.get_or(event, [])
    ctx.ev_map.set(event, [...units, unit])

    return {
        enable: () => actions.enable(event, handler),
        disable: () => actions.disable(event, handler),
    }
}

const unregister_inner = <E, K extends keyof E>(
    ctx: Context<E, K>,
    event: K,
    handler?: Handler<E[K]>,
) => {
    if (!ctx.ev_map.has(event)) {
        ctx.trace('ERROR', `(unregister)event#${String(event)}: not found`)
        return
    }

    if (!handler) {
        ctx.ev_map.set(event, [])
        return
    }

    ctx.ev_map.set(
        event,
        ctx.ev_map.get(event)!.filter((unit) => unit.handler !== handler),
    )
}

const emit_inner = <E, K extends keyof E>(
    ctx: Context<E, K>,
    actions: { unregister: Unregister<E> },
    event: K,
    payload?: E[K],
) => {
    if (!ctx.ev_map.has(event)) {
        ctx.trace('ERROR', `(emit)event#${String(event)}: not found`)
        return
    }

    const enabled_units = ctx
        .ev_map
        .get(event)!
        .filter((unit) => unit.enabled)
        .map((unit) => ({
            handler: unit.handler,
            once: unit.once,
        }))

    for (const h of enabled_units) {
        h.handler(payload)
        if (h.once) actions.unregister(event, h.handler)
    }
}

export const createEvarcher = <
    E,
    K extends keyof E = keyof E,
>(
    option?: EvarcherOption<E, K>,
): EvarcherReturn<E> => {
    const opt = merge_option(option)
    const ev_map = new EvMap<E>()
    const trace = createTrace(opt.trace)
    const ctx: Context<E, K> = { ev_map, opt, trace }

    const enable: Enable<E> = (event, handler) =>
        enable_inner(ctx, event, handler)

    const disable: Disable<E> = (event, handler) =>
        disable_inner(ctx, event, handler)

    const register: Register<E> = (event, handler) =>
        register_inner(ctx, { enable, disable }, event, handler)

    const once: Once<E> = (event, handler) =>
        once_inner(ctx, { enable, disable }, event, handler)

    const unregister: Unregister<E> = (event, handler) =>
        unregister_inner(ctx, event, handler)

    const emit: Emit<E> = (event, payload) =>
        emit_inner(ctx, { unregister }, event, payload)

    return {
        enable,
        disable,
        register,
        once,
        unregister,
        emit,
    }
}
