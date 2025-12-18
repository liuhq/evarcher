import type { EvFn } from '../entry/create.type'
import type { Context } from './context'
import { ev_ } from './event'

export const ns_ = <E>(
    ctx: Context<E>,
    namespace: string,
): EvFn<E> => {
    return <K extends keyof E>(event: K) => {
        return ev_(ctx, namespace, event)
    }
}
