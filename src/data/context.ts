import type { Operator } from '../entry/create.type'
import { createError, type EventErrorFn } from '../entry/error'
import type { InternalEvOption } from '../entry/option'
import { type Counter, createCounter } from '../utils/counter'
import type { Trace } from '../utils/trace'
import { createTrace } from '../utils/trace'
import { ExtendMap } from './ex_map'
import type { EventCollection } from './types'
import type { HandlerUnit } from './unit'

export type EventKey<C extends EventCollection> = keyof C
export type EventHandlerMap<C extends EventCollection> = ExtendMap<
    EventKey<C>,
    HandlerUnit<C, any>[]
>
export type NamespaceMap<C extends EventCollection> = ExtendMap<
    string,
    EventHandlerMap<C>
>

type TraceSlot = {
    layer?: 'namespace' | 'event'
    op?: keyof Operator<never, never>
    message: string
}

export type Context<C extends EventCollection> = {
    opt: InternalEvOption
    global_counter: Counter
    trace: ReturnType<Trace<TraceSlot>>
    handle_error: EventErrorFn
    ns_map: NamespaceMap<C>
}

export const createContext = <C extends EventCollection>(
    default_item: Iterable<readonly [string, EventHandlerMap<C>]>,
    opt: InternalEvOption,
): Context<C> => {
    const global_counter = createCounter(0)
    const trace = createTrace<TraceSlot>(opt.trace)(
        ({ meta: { datetime, level }, slot }) => {
            const layer = slot.layer ? `${slot.layer}::` : ''
            const op = slot.op ? `${slot.op}: ` : ''
            const dt = datetime()

            return `[${dt.date()} ${dt.time()} ${level.toUpperCase()}] ${layer}${op}${slot.message}`
        },
    )

    const handle_error = createError(opt.handleError)

    const ns_map = new ExtendMap<string, EventHandlerMap<C>>(
        default_item,
    )

    return {
        opt,
        global_counter,
        trace,
        handle_error,
        ns_map,
    }
}
