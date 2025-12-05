export type Handler<P> = (
    ...payload: P extends void | undefined ? [payload?: undefined]
        : [payload: P]
) => void

export interface HandlerUnit<E, K extends keyof E> {
    handler: Handler<E[K]>
    id: string
    enabled: boolean
    priority: number
    once: boolean
}

export const unit_ = <E, K extends keyof E>(
    { enabled, priority, once }: Omit<HandlerUnit<E, K>, 'handler' | 'id'>,
) => {
    return (
        id: string,
        handler: Handler<E[K]>,
    ): HandlerUnit<E, K> => {
        return {
            handler,
            id,
            enabled,
            priority,
            once,
        }
    }
}
