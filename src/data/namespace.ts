import type { EvFn } from '../entry/create.type.ts'
import type { Context } from './context.ts'
import { ev_ } from './event.ts'
import type { EventCollection } from './types.ts'

export const ns_ = <C extends EventCollection>(
    ctx: Context<C>,
    namespace: string,
): EvFn<C> => {
    return <K extends keyof C>(event: K) => {
        return ev_(ctx, namespace, event)
    }
}
