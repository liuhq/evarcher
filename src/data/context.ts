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

export type Context<E> = {
    opt: InternalEvOption
    global_counter: Counter
    trace: Trace

    ns_map: NamespaceMap<E>
}

export const createContext = <E>(
    default_item: Iterable<readonly [string, EventHandlerMap<E>]>,
    opt: InternalEvOption,
): Context<E> => {
    const global_counter = createCounter(0)
    const trace = createTrace(opt.trace)

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
