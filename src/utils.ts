import type { HandlerUnit } from './ex_map'
import type { Handler } from './types'

type Level = 'INFO' | 'WARN' | 'ERROR'
export type Trace = (level: Level, message: string) => void
export const createTrace = (enabled: boolean): Trace => {
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

export type UpdaterProcessor<E, K extends keyof E, P = HandlerUnit<E, K>> = (
    unit: Partial<P>,
) => Partial<P>

export const updater = <E, K extends keyof E, P = HandlerUnit<E, K>>(
    units: P[],
) => {
    return {
        at: <PK extends keyof P>(path: [PK, P[PK]] | '*') => {
            return {
                by: (processor: UpdaterProcessor<E, K, P>): P[] =>
                    units.map((u) => {
                        if (path === '*' || path.length < 2) {
                            return { ...u, ...processor(u) }
                        }

                        return u[path[0]] === path[1]
                            ? { ...u, ...processor(u) }
                            : u
                    }),
            }
        },
    }
}
