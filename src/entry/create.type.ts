import type { Handler } from '../data/unit'

export type FnVoid = (...any: any[]) => void

export type RegisterReturn = {
    id: string
    enable: FnVoid
    disable: FnVoid
}

export type Operator<E, K extends keyof E> = {
    register: (handler: Handler<E[K]>) => RegisterReturn
    once: (handler: Handler<E[K]>) => RegisterReturn
    unregister: {
        (handler?: Handler<E[K]>): void
        (id?: string): void
    }
    enable: {
        (handler?: Handler<E[K]>): void
        (id?: string): void
    }
    disable: {
        (handler?: Handler<E[K]>): void
        (id?: string): void
    }
    emit: (
        ...payload: E[K] extends void | undefined ? [payload?: undefined]
            : [payload: E[K]]
    ) => void
}

export type Enable<E, K extends keyof E> = Operator<E, K>['enable']
export type Disable<E, K extends keyof E> = Operator<E, K>['disable']
export type Register<E, K extends keyof E> = Operator<E, K>['register']
export type Once<E, K extends keyof E> = Operator<E, K>['once']
export type Unregister<E, K extends keyof E> = Operator<E, K>['unregister']
export type Emit<E, K extends keyof E> = Operator<E, K>['emit']

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
