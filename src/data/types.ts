import type { EventHandlerMap } from './context'

export type GetEvMap<E> = () => EventHandlerMap<E> | undefined
