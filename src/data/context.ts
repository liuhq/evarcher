import type { Operator } from '../entry/create.type'
import type { InternalEvOption } from '../entry/option'
import { type Counter, createCounter } from '../utils/counter'
import type { Trace } from '../utils/trace'
import { createTrace } from '../utils/trace'
import { ExtendMap } from './ex_map'
import type { HandlerUnit } from './unit'

export type EventKey<E> = keyof E
export type EventHandlerMap<E> = ExtendMap<
    EventKey<E>,
    HandlerUnit<E, any>[]
>
export type NamespaceMap<E> = ExtendMap<
    string,
    EventHandlerMap<E>
>

type TraceSlot = {
    layer?: 'namespace' | 'event'
    op?: keyof Operator<never, never>
    message: string
}

export type Context<E> = {
    opt: InternalEvOption
    global_counter: Counter
    trace: ReturnType<Trace<TraceSlot>>

    ns_map: NamespaceMap<E>
}

export const createContext = <E>(
    default_item: Iterable<readonly [string, EventHandlerMap<E>]>,
    opt: InternalEvOption,
): Context<E> => {
    const global_counter = createCounter(0)
    const trace = createTrace<TraceSlot>(opt.trace)(
        ({ meta: { datetime, level }, slot }) => {
            const layer = slot.layer ? `${slot.layer}::` : ''
            const op = slot.op ? `${slot.op}: ` : ''
            const dt = datetime()

            return `[${dt.date()} ${dt.time()} ${level.toUpperCase()}] ${layer}${op}${slot.message}`
        },
    )

    const ns_map = new ExtendMap<string, EventHandlerMap<E>>(
        default_item,
    )

    return {
        opt,
        global_counter,
        trace,
        ns_map,
    }
}
