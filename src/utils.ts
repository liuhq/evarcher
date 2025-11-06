import type { HandlerUnit } from './data_struct'
import type { Handler } from './types'

type Level = 'INFO' | 'WARN' | 'ERROR'

export const createTrace = (enabled: boolean) => {
    const report: { [L in Level]: (message: string) => void } = {
        INFO: (msg) => {
            console.info(msg)
        },
        WARN: (msg) => {
            console.warn(msg)
        },
        ERROR: (msg) => {
            console.error(msg)
        },
    }

    return (level: Level, message: string) => {
        if (enabled) {
            report[level](message)
        }
    }
}

export const updated_by_handler = <E, K extends keyof E>(
    units: HandlerUnit<E, K>[],
    handler: Handler<E[K]>,
    updater: (item: Partial<HandlerUnit<E, K>>) => Partial<HandlerUnit<E, K>>,
): HandlerUnit<E, K>[] => {
    return units.map((h) => h.handler === handler ? { ...h, ...updater(h) } : h)
}
