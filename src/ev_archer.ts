import { ExtendMap, type HandlerUnit } from './ex_map'
import type {
    EvarcherOption,
    EvarcherReturn,
    Handler,
    InternalEvOption,
} from './types'
import {
    createTrace,
    type Trace,
    updater,
    type UpdaterProcessor,
} from './utils'

const DEFAULT_NAMESPACE = 'GLOBAL'
const DEFAULT_PRIORITY = 0

const merge_option = <E, K extends keyof E>(
    option: EvarcherOption | undefined,
): InternalEvOption => {
    const default_option: InternalEvOption = {
        id: 0,
        tag: false,
        defaultNamespace: DEFAULT_NAMESPACE,
        defaultEnabled: false,
        trace: false,
    }
    return Object.assign(default_option, option ?? {})
}

type EventHandlerMap<E> = ExtendMap<keyof E, HandlerUnit<E, any>[]>

type Context<E> = {
    ns_map: ExtendMap<string, EventHandlerMap<E>>
    ev_map: ExtendMap<keyof E, HandlerUnit<E, any>[]>
    opt: InternalEvOption
    trace: Trace
}

type Enable<E> = EvarcherReturn<E>['enable']
type Disable<E> = EvarcherReturn<E>['disable']
type Register<E> = EvarcherReturn<E>['register']
type Once<E> = EvarcherReturn<E>['once']
type Unregister<E> = EvarcherReturn<E>['unregister']
type Emit<E> = EvarcherReturn<E>['emit']

const enable_inner = <E, K extends keyof E>(
    ctx: Context<E>,
    namespace: string,
    event: K,
    handler?: Handler<E[K]>,
) => {
    if (!ctx.ns_map.has(namespace)) {
        ctx.trace('ERROR', `(enable)namespace#${namespace}: not found`)
        return
    }

    const ev_map = ctx.ns_map.get(namespace)!

    if (!ev_map.has(event)) {
        ctx.trace('ERROR', `(enable)event#${String(event)}: not found`)
        return
    }

    const units = ev_map.get(event)!
    const units_updater = updater(units)
    const processor: UpdaterProcessor<E, K> = () => ({ enabled: true })

    if (!handler) {
        ctx.trace('WARN', `(enable)event#${String(event)}: ALL ENABLE`)
        const updated = units_updater.at('*').by(processor)
        const new_ev_map = ExtendMap.from(ev_map).set(event, updated)
        ctx.ns_map = ExtendMap.from(ctx.ns_map).set(namespace, new_ev_map)
        return
    }

    const updated = units_updater.at(['handler', handler]).by(processor)
    const new_ev_map = ExtendMap.from(ev_map).set(event, updated)
    ctx.ns_map = ExtendMap.from(ctx.ns_map).set(namespace, new_ev_map)
}

const disable_inner = <E, K extends keyof E>(
    ctx: Context<E>,
    namespace: string,
    event: K,
    handler?: Handler<E[K]>,
) => {
    if (!ctx.ns_map.has(namespace)) {
        ctx.trace('ERROR', `(disable)namespace#${namespace}: not found`)
        return
    }

    const ev_map = ctx.ns_map.get(namespace)!

    if (!ev_map.has(event)) {
        ctx.trace('ERROR', `(disable)event#${String(event)}: not found`)
        return
    }

    const units = ev_map.get(event)!
    const units_updater = updater(units)
    const processer: UpdaterProcessor<E, K> = () => ({ enabled: false })

    if (!handler) {
        ctx.trace('WARN', `(disable)event#${String(event)}: ALL DISABLE`)
        const updated = units_updater.at('*').by(processer)
        const new_ev_map = ExtendMap.from(ev_map).set(event, updated)
        ctx.ns_map = ExtendMap.from(ctx.ns_map).set(namespace, new_ev_map)
        return
    }

    const updated = units_updater.at(['handler', handler]).by(processer)
    const new_ev_map = ExtendMap.from(ev_map).set(event, updated)
    ctx.ns_map = ExtendMap.from(ctx.ns_map).set(namespace, new_ev_map)
}

const register_inner = <E, K extends keyof E>(
    ctx: Context<E>,
    actions: {
        enable: Enable<E>
        disable: Disable<E>
    },
    namespace: string,
    event: K,
    handler: Handler<E[K]>,
) => {
    const unit: HandlerUnit<E, K> = {
        handler,
        enabled: ctx.opt.defaultEnabled,
        priority: DEFAULT_PRIORITY,
        once: false,
    }

    ctx.trace('INFO', `(register)event#${String(event)}`)

    const ev_map = ctx.ns_map.get_or(namespace, new ExtendMap())
    const units = ev_map.get_or(event, [])

    const new_ev_map = ExtendMap.from(ev_map).set(event, [...units, unit])
    ctx.ns_map = ExtendMap.from(ctx.ns_map).set(namespace, new_ev_map)

    return {
        enable: () => actions.enable(event, handler),
        disable: () => actions.disable(event, handler),
    }
}

const once_inner = <E, K extends keyof E>(
    ctx: Context<E>,
    actions: {
        enable: Enable<E>
        disable: Disable<E>
    },
    namespace: string,
    event: K,
    handler: Handler<E[K]>,
) => {
    const unit: HandlerUnit<E, K> = {
        handler,
        enabled: ctx.opt.defaultEnabled,
        priority: DEFAULT_PRIORITY,
        once: true,
    }

    ctx.trace('INFO', `(once)event#${String(event)}`)

    const ev_map = ctx.ns_map.get_or(namespace, new ExtendMap())
    const units = ev_map.get_or(event, [])

    const new_ev_map = ExtendMap.from(ev_map).set(event, [...units, unit])
    ctx.ns_map = ExtendMap.from(ctx.ns_map).set(namespace, new_ev_map)

    return {
        enable: () => actions.enable(event, handler),
        disable: () => actions.disable(event, handler),
    }
}

const unregister_inner = <E, K extends keyof E>(
    ctx: Context<E>,
    namespace: string,
    event: K,
    handler?: Handler<E[K]>,
) => {
    if (!ctx.ns_map.has(namespace)) {
        ctx.trace('ERROR', `(unregister)namespace#${namespace}: not found`)
        return
    }

    const ev_map = ctx.ns_map.get(namespace)!

    if (!ev_map.has(event)) {
        ctx.trace('ERROR', `(unregister)event#${String(event)}: not found`)
        return
    }

    if (!handler) {
        ev_map.set(event, [])
        return
    }

    const updated = ev_map.get(event)!.filter((unit) =>
        unit.handler !== handler
    )
    const new_ev_map = ExtendMap.from(ev_map).set(event, updated)
    ctx.ns_map = ExtendMap.from(ctx.ns_map).set(namespace, new_ev_map)
}

const emit_inner = <E, K extends keyof E>(
    ctx: Context<E>,
    actions: { unregister: Unregister<E> },
    namespace: string,
    event: K,
    payload: E[K] extends void | undefined ? [payload?: undefined]
        : [payload: E[K]],
) => {
    if (!ctx.ns_map.has(namespace)) {
        ctx.trace('ERROR', `(unregister)namespace#${namespace}: not found`)
        return
    }

    const ev_map = ctx.ns_map.get(namespace)!

    if (!ev_map.has(event)) {
        ctx.trace('ERROR', `(emit)event#${String(event)}: not found`)
        return
    }

    const enabled_units = ev_map
        .get(event)!
        .filter((unit) => unit.enabled)
        .map((unit) => ({
            handler: unit.handler,
            once: unit.once,
        }))

    for (const h of enabled_units) {
        h.handler(...payload)
        if (h.once) actions.unregister(event, h.handler)
    }
}

export const createEvarcher = <E>(
    option?: EvarcherOption,
): EvarcherReturn<E> => {
    const opt = merge_option(option)
    const default_namespace = opt.defaultNamespace
    const default_ev_map = new ExtendMap<keyof E, HandlerUnit<E, any>[]>()

    const default_item = [[default_namespace, default_ev_map]] as const
    const ns_map = new ExtendMap<string, EventHandlerMap<E>>(default_item)

    const ev_map = new ExtendMap<keyof E, HandlerUnit<E, any>[]>()
    const trace = createTrace(opt.trace)
    const ctx: Context<E> = { ns_map, ev_map, opt, trace }

    const enable: Enable<E> = (event, handler) =>
        enable_inner(ctx, default_namespace, event, handler)

    const disable: Disable<E> = (event, handler) =>
        disable_inner(ctx, default_namespace, event, handler)

    const register: Register<E> = (event, handler) =>
        register_inner(
            ctx,
            { enable, disable },
            default_namespace,
            event,
            handler,
        )

    const once: Once<E> = (event, handler) =>
        once_inner(ctx, { enable, disable }, default_namespace, event, handler)

    const unregister: Unregister<E> = (event, handler) =>
        unregister_inner(ctx, default_namespace, event, handler)

    const emit: Emit<E> = (event, ...payload) =>
        emit_inner(ctx, { unregister }, default_namespace, event, payload)

    return {
        enable,
        disable,
        register,
        once,
        unregister,
        emit,
    }
}
