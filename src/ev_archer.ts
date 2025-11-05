import { EvMap } from './data_struct'
import type { EvarcherOption, EvarcherReturn, InternalEvOption } from './types'

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
        strictMode: false,
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

    const enable: Enable<E> = (event, callback) => {
        if (!ev_map.has(event)) {
            if (opt.strictMode) {
                throw new Error(`Event: ${event as string} was not registered`)
            }
            return
        }
        if (!callback) {
            ev_map.set(
                event,
                ev_map.get(event)!.map((unit) => ({
                    ...unit,
                    enabled: true,
                })),
            )
            return
        }
        const target = ev_map.get(event)!.find((unit) =>
            unit.callback === callback
        )
        if (!target) {
            if (opt.strictMode) {
                throw new Error(
                    `Event: ${event as string} does not found this callback`,
                )
            }
            return
        }
        target.enabled = true
    }

    const disable: Disable<E> = (event, callback) => {
        if (!ev_map.has(event)) {
            if (opt.strictMode) {
                throw new Error(`Event: ${event as string} was not registered`)
            }
            return
        }
        if (!callback) {
            ev_map.set(
                event,
                ev_map.get(event)!.map((unit) => ({ ...unit, enabled: false })),
            )
            return
        }
        const target = ev_map.get(event)!.find((unit) =>
            unit.callback === callback
        )
        if (!target) {
            if (opt.strictMode) {
                throw new Error(
                    `Event: ${event as string} does not found this callback`,
                )
            }
            return
        }
        target.enabled = false
    }

    const register: Register<E> = (event, callback) => {
        const unit = {
            callback,
            enabled: opt.defaultEnabled,
            namespace: opt.defaultNamespace,
            priority: DEFAULT_PRIORITY,
            once: false,
        }
        if (!ev_map.has(event)) {
            ev_map.set(event, [unit])
        } else {
            const units = ev_map.get_or(event, [])
            ev_map.set(event, [...units, unit])
        }

        return {
            enable: () => enable(event, callback),
            disable: () => disable(event, callback),
        }
    }

    const once: Once<E> = (event, callback) => {
        const enabled = opt.defaultEnabled ?? false
        const unit = {
            callback,
            enabled,
            namespace: opt.defaultNamespace,
            priority: DEFAULT_PRIORITY,
            once: true,
        }

        if (!ev_map.has(event)) {
            ev_map.set(event, [unit])
        } else {
            const units = ev_map.get_or(event, [])
            ev_map.set(event, [...units, unit])
        }

        return {
            enable: () => enable(event, callback),
            disable: () => disable(event, callback),
        }
    }

    const unregister: Unregister<E> = (event, callback) => {
        if (!ev_map.has(event)) {
            if (opt.strictMode) {
                throw new Error(`Event: ${event as string} was not registered`)
            }
            return
        }
        if (!callback) {
            ev_map.set(event, [])
            return
        }
        ev_map.set(
            event,
            ev_map.get(event)!.filter((unit) => unit.callback !== callback),
        )
    }

    const emit: Emit<E> = (event, payload) => {
        if (!ev_map.has(event)) {
            if (opt.strictMode) {
                throw new Error(`Event: ${event as string} was not registered`)
            }
            return
        }

        const enabled_units = ev_map
            .get(event)!
            .filter((unit) => unit.enabled)
            .map((unit) => unit.callback)

        for (const h of enabled_units) {
            h(payload)
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
