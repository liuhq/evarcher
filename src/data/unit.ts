import type { EventCollection, EventConfig } from './types'

export type Handler<E extends EventConfig> = (
    ...payload: E extends void | undefined ? [payload?: undefined]
        : [payload: E['payload']]
) => E['result']

export interface HandlerUnit<C extends EventCollection, K extends keyof C> {
    handler: Handler<C[K]>
    id: string
    enabled: boolean
    priority: number
    once: boolean
}

export const unit_ = <C extends EventCollection, K extends keyof C>(
    { enabled, priority, once }: Omit<HandlerUnit<C, K>, 'handler' | 'id'>,
) => {
    return (
        id: string,
        handler: Handler<C[K]>,
    ): HandlerUnit<C, K> => {
        return {
            handler,
            id,
            enabled,
            priority,
            once,
        }
    }
}
