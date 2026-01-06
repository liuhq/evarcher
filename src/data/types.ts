import type { EventHandlerMap } from './context'

export type GetEvMap<C extends EventCollection> = () =>
    | EventHandlerMap<C>
    | undefined

export interface EventConfig {
    payload: any
    result: any
}

export type EventCollection = Record<string, EventConfig>

/**
 * Define a type-safe collection of events.
 *
 * @example
 * type MyEvents = DefineEvents<{
 *     open: {
 *         payload: string
 *         result: void
 *     }
 *     pos: {
 *         payload: {
 *             x: number
 *             y: number
 *         }
 *         result: number[]
 *     }
 * }>
 */
export type DefineEvents<T extends EventCollection> = T
