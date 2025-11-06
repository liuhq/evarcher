export type FnVoid = (...any: any[]) => void

export type Handler<P = any> = (payload?: P) => void

export type InternalEvOption<E, K extends keyof E> = {
    id: number
    tag: boolean
    defaultNamespace: string
    /** default enabled, or not: false */
    defaultEnabled: boolean
    trace: boolean
}

export type EvarcherOption<E, K extends keyof E> = Partial<
    InternalEvOption<E, K>
>

export type EvarcherReturn<E> = {
    register: <K extends keyof E>(
        event: K,
        callback: Handler<E[K]>,
    ) => RegisterReturn
    once: <K extends keyof E>(
        event: K,
        callback: Handler<E[K]>,
    ) => RegisterReturn
    unregister: <K extends keyof E>(
        event: K,
        callback?: Handler<E[K]>,
    ) => void
    enable: <K extends keyof E>(
        event: K,
        callback?: Handler<E[K]>,
    ) => void
    disable: <K extends keyof E>(
        event: K,
        callback?: Handler<E[K]>,
    ) => void
    emit: <K extends keyof E>(
        event: K,
        payload?: E[K],
    ) => void
}

export type RegisterReturn = {
    enable: FnVoid
    disable: FnVoid
}
