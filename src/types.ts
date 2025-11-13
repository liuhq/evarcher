export type FnVoid = (...any: any[]) => void

export type Handler<P> = (
    ...payload: P extends void | undefined ? [payload?: undefined]
        : [payload: P]
) => void

export type InternalEvOption = {
    /** WIP */
    id: number
    /** WIP */
    tag: boolean
    /** WIP */
    defaultNamespace: string
    /** default enabled, or not: false */
    defaultEnabled: boolean
    trace: boolean
}

export type EvarcherOption = Partial<Pick<InternalEvOption, 'defaultEnabled'>>

export type EvarcherReturn<E> = {
    register: <K extends keyof E>(
        event: K,
        handler: Handler<E[K]>,
    ) => RegisterReturn
    once: <K extends keyof E>(
        event: K,
        handler: Handler<E[K]>,
    ) => RegisterReturn
    unregister: <K extends keyof E>(
        event: K,
        handler?: Handler<E[K]>,
    ) => void
    enable: <K extends keyof E>(
        event: K,
        handler?: Handler<E[K]>,
    ) => void
    disable: <K extends keyof E>(
        event: K,
        handler?: Handler<E[K]>,
    ) => void
    emit: <K extends keyof E>(
        event: K,
        ...payload: E[K] extends void | undefined ? [payload?: undefined]
            : [payload: E[K]]
    ) => void
}

export type RegisterReturn = {
    enable: FnVoid
    disable: FnVoid
}
