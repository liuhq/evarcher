import type { HandlerUnit } from '../data/unit'

type EvErrorTarget = {
    namespace: string
    event: string
    unitId: HandlerUnit<any, any>['id']
}

export type EvarcherError = {
    target: EvErrorTarget
    message: string
}

export type HandleError = (error: EvarcherError) => void

export const DEFAULT_HANDLE_ERROR: HandleError = ({ target, message }) => {
    const formatted = `${target.unitId} <-x- ${message}`
    console.error(formatted)
}

export type UnitErrorFn = (
    unitId: HandlerUnit<any, any>['id'],
    message: string,
) => void
export type EventErrorFn = (namespace: string, event: string) => UnitErrorFn
export type CreateErrorFn = (handler: HandleError) => EventErrorFn

export const createError: CreateErrorFn =
    (handler: HandleError): EventErrorFn =>
    (namespace: string, event: string): UnitErrorFn =>
    (
        unitId: HandlerUnit<any, any>['id'],
        message: string,
    ) => {
        const error = {
            target: {
                namespace,
                event,
                unitId,
            },
            message,
        }

        handler(error)
    }
