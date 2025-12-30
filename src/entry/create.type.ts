import type { Handler } from '../data/unit'

export type FnVoid = (...any: any[]) => void

export type Enable<E, K extends keyof E> = {
    (handler?: Handler<E[K]>): void
    (id?: string): void
}

export type Disable<E, K extends keyof E> = {
    (handler?: Handler<E[K]>): void
    (id?: string): void
}

export type RegisterReturn = {
    id: string
    enable: FnVoid
    disable: FnVoid
}

export type Register<E, K extends keyof E> = (
    handler: Handler<E[K]>,
) => RegisterReturn

export type Once<E, K extends keyof E> = (
    handler: Handler<E[K]>,
) => RegisterReturn

export type Unregister<E, K extends keyof E> = {
    (handler?: Handler<E[K]>): void
    (id?: string): void
}

export type Emit<E, K extends keyof E> = (
    ...payload: E[K] extends void | undefined ? [payload?: undefined]
        : [payload: E[K]]
) => void

export type EmitAsync<E, K extends keyof E> = (
    ...payload: E[K] extends void | undefined ? [payload?: undefined]
        : [payload: E[K]]
) => Promise<void>

export type Parallel<E, K extends keyof E> = {
    emit: EmitAsync<E, K>
}

export type Serial<E, K extends keyof E> = {
    emit: EmitAsync<E, K>
}

export type Operator<E, K extends keyof E> = {
    enable: Enable<E, K>
    disable: Disable<E, K>
    register: Register<E, K>
    once: Once<E, K>
    unregister: Unregister<E, K>
    emit: Emit<E, K>
    parallel: Parallel<E, K>
    serial: Serial<E, K>
}

export type EvFn<E> = <K extends keyof E>(event: K) => Operator<E, K>

export type EvarcherReturn<E> = {
    ns: (namespace: string) => EvFn<E>
    ev: EvFn<E>
    /**
     * @constant
     * @default "DEFAULT_NAMESPACE"
     */
    readonly DEFAULT_NAMESPACE: string
}
