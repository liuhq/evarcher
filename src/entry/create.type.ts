import type { EventCollection } from '../data/types'
import type { Handler } from '../data/unit'

export type FnVoid = (...any: any[]) => void

export type Enable<C extends EventCollection, K extends keyof C> = {
    (handler?: Handler<C[K]>): void
    (id?: string): void
}

export type Disable<C extends EventCollection, K extends keyof C> = {
    (handler?: Handler<C[K]>): void
    (id?: string): void
}

export type RegisterReturn = {
    id: string
    enable: FnVoid
    disable: FnVoid
}

export type Register<C extends EventCollection, K extends keyof C> = (
    handler: Handler<C[K]>,
) => RegisterReturn

export type Once<C extends EventCollection, K extends keyof C> = (
    handler: Handler<C[K]>,
) => RegisterReturn

export type Unregister<C extends EventCollection, K extends keyof C> = {
    (handler?: Handler<C[K]>): void
    (id?: string): void
}

export type Emit<C extends EventCollection, K extends keyof C> = (
    ...payload: C[K]['payload'] extends void | undefined ? [payload?: undefined]
        : [payload: C[K]['payload']]
) => void

export type EmitAsync<C extends EventCollection, K extends keyof C> = (
    ...payload: C[K]['payload'] extends void | undefined ? [payload?: undefined]
        : [payload: C[K]['payload']]
) => Promise<void>

export type Collect<C extends EventCollection, K extends keyof C> = (
    ...payload: C[K]['payload'] extends void | undefined ? [payload?: undefined]
        : [payload: C[K]['payload']]
) => Array<C[K]['result']>

export type CollectAsync<C extends EventCollection, K extends keyof C> = (
    ...payload: C[K]['payload'] extends void | undefined ? [payload?: undefined]
        : [payload: C[K]['payload']]
) => Promise<Array<C[K]['result']>>

export type Parallel<C extends EventCollection, K extends keyof C> = {
    emit: EmitAsync<C, K>
    collect: CollectAsync<C, K>
}

export type Serial<C extends EventCollection, K extends keyof C> = {
    emit: EmitAsync<C, K>
    collect: CollectAsync<C, K>
}

export type Operator<C extends EventCollection, K extends keyof C> = {
    enable: Enable<C, K>
    disable: Disable<C, K>
    register: Register<C, K>
    once: Once<C, K>
    unregister: Unregister<C, K>
    emit: Emit<C, K>
    collect: Collect<C, K>
    parallel: Parallel<C, K>
    serial: Serial<C, K>
}

export type EvFn<C extends EventCollection> = <K extends keyof C>(
    event: K,
) => Operator<C, K>

export type EvarcherReturn<C extends EventCollection> = {
    ns: (namespace: string) => EvFn<C>
    ev: EvFn<C>
    /**
     * @constant
     * @default "DEFAULT_NAMESPACE"
     */
    readonly DEFAULT_NAMESPACE: string
}
