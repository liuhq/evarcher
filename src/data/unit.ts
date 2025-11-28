import { DEFAULT_ONCE, DEFAULT_PRIORITY } from '../constants'
import type { Context } from './context'

export type Handler<P> = (
    ...payload: P extends void | undefined ? [payload?: undefined]
        : [payload: P]
) => void

export interface HandlerUnit<E, K extends keyof E> {
    handler: Handler<E[K]>
    token: string
    enabled: boolean
    priority: number
    once: boolean
}

export const create_unit = <E, K extends keyof E>(
    ctx: Context<E>,
    {
        enabled: i_enabled,
        priority: i_priority,
        once: i_once,
        token: i_token,
    }: Partial<
        Omit<HandlerUnit<E, K>, 'handler'>
    >,
) => {
    const token = i_token ?? `$:${ctx.global_counter.get()}`
    const enabled = i_enabled ?? ctx.opt.defaultEnabled
    const priority = i_priority ?? DEFAULT_PRIORITY
    const once = i_once ?? DEFAULT_ONCE

    return (
        handler: Handler<E[K]>,
    ): HandlerUnit<E, K> => {
        return {
            handler,
            token,
            enabled,
            priority,
            once,
        }
    }
}
