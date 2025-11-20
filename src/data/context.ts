import type { DEFAULT_EVENT } from '../constants'
import type { InternalEvOption } from '../entry/option'
import { type Counter, createCounter } from '../utils/counter'
import type { Trace } from '../utils/trace'
import { createTrace } from '../utils/trace'
import { ExtendMap } from './ex_map'
import type { HandlerUnit } from './unit'

type DEFAULT_EVENT_TYPE = typeof DEFAULT_EVENT

export type EventKey<E, G = DEFAULT_EVENT_TYPE> = keyof E | G
export type EventHandlerMap<E, G = DEFAULT_EVENT_TYPE> = ExtendMap<
    EventKey<E, G>,
    HandlerUnit<E, any>[]
>
export type NamespaceMap<E, G = DEFAULT_EVENT_TYPE> = ExtendMap<
    string,
    EventHandlerMap<E, G>
>

export type Context<E, G = DEFAULT_EVENT_TYPE> = {
    opt: InternalEvOption
    global_counter: Counter
    trace: Trace

    ns_map: NamespaceMap<E, G>
}

export const createContext = <E, G>(
    default_item: Iterable<readonly [string, EventHandlerMap<E, G>]>,
    opt: InternalEvOption,
): Context<E, G> => {
    const global_counter = createCounter(0)
    const trace = createTrace(opt.trace)

    const ns_map = new ExtendMap<string, EventHandlerMap<E, G>>(
        default_item,
    )

    return {
        opt,
        global_counter,
        trace,
        ns_map,
    }
}
