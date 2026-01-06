import type { EvFn } from '../entry/create.type'
import type { Context } from './context'
import { ev_ } from './event'
import type { EventCollection } from './types'

export const ns_ = <C extends EventCollection>(
    ctx: Context<C>,
    namespace: string,
): EvFn<C> => {
    return <K extends keyof C>(event: K) => {
        return ev_(ctx, namespace, event)
    }
}
