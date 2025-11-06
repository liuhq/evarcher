import { EvMap } from './data_struct'
import type { EvarcherOption, EvarcherReturn, InternalEvOption } from './types'
import { createTrace, updated_by_handler } from './utils'

type Enable<E> = EvarcherReturn<E>['enable']
type Disable<E> = EvarcherReturn<E>['disable']
type Register<E> = EvarcherReturn<E>['register']
type Once<E> = EvarcherReturn<E>['once']
type Unregister<E> = EvarcherReturn<E>['unregister']
type Emit<E> = EvarcherReturn<E>['emit']

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

export const createEvarcher = <
    E,
    K extends keyof E = keyof E,
>(
    option?: EvarcherOption<E, K>,
): EvarcherReturn<E> => {
    const opt = merge_option(option)
    const ev_map = new EvMap<E>()
    const trace = createTrace(opt.trace)

    const enable: Enable<E> = (event, handler) => {
        if (!ev_map.has(event)) {
            trace('ERROR', `(enable)event#${String(event)}: not found`)
            return
        }

        if (!handler) {
            trace('WARN', `(enable)event#${String(event)}: ALL ENABLE`)
            ev_map.set(
                event,
                ev_map.get(event)!.map((unit) => ({
                    ...unit,
                    enabled: true,
                })),
            )
            return
        }

        ev_map.set(
            event,
            updated_by_handler(
                ev_map.get(event)!,
                handler,
                () => ({ enabled: true }),
            ),
        )
    }

    const disable: Disable<E> = (event, handler) => {
        if (!ev_map.has(event)) {
            trace('ERROR', `(disable)event#${String(event)}: not found`)
            return
        }

        if (!handler) {
            trace('WARN', `(disable)event#${String(event)}: ALL DISABLE`)
            ev_map.set(
                event,
                ev_map.get(event)!.map((unit) => ({ ...unit, enabled: false })),
            )
            return
        }

        ev_map.set(
            event,
            updated_by_handler(
                ev_map.get(event)!,
                handler,
                () => ({ enabled: false }),
            ),
        )
    }

    const register: Register<E> = (event, handler) => {
        const unit = {
            handler,
            enabled: opt.defaultEnabled,
            namespace: opt.defaultNamespace,
            priority: DEFAULT_PRIORITY,
            once: false,
        }

        trace('INFO', `(register)event#${String(event)}`)

        const units = ev_map.get_or(event, [])
        ev_map.set(event, [...units, unit])

        return {
            enable: () => enable(event, handler),
            disable: () => disable(event, handler),
        }
    }

    const once: Once<E> = (event, handler) => {
        const unit = {
            handler,
            enabled: opt.defaultEnabled,
            namespace: opt.defaultNamespace,
            priority: DEFAULT_PRIORITY,
            once: true,
        }

        trace('INFO', `(once)event#${String(event)}`)

        const units = ev_map.get_or(event, [])
        ev_map.set(event, [...units, unit])

        return {
            enable: () => enable(event, handler),
            disable: () => disable(event, handler),
        }
    }

    const unregister: Unregister<E> = (event, handler) => {
        if (!ev_map.has(event)) {
            trace('ERROR', `(unregister)event#${String(event)}: not found`)
            return
        }

        if (!handler) {
            ev_map.set(event, [])
            return
        }

        ev_map.set(
            event,
            ev_map.get(event)!.filter((unit) => unit.handler !== handler),
        )
    }

    const emit: Emit<E> = (event, payload) => {
        if (!ev_map.has(event)) {
            trace('ERROR', `(emit)event#${String(event)}: not found`)
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
            h.handler(payload)
            if (h.once) unregister(event, h.handler)
        }
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
