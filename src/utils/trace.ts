import { type DateTime, datetime } from './datetime'

type Accessor<T> = () => T

type TraceTemplateMeta = {
    level: Level
    datetime: Accessor<DateTime>
}

type TraceTemplateProps<S extends Record<string, unknown>> = {
    meta: TraceTemplateMeta
    slot: S
}

type TraceTemplate<S extends Record<string, unknown>> = (
    props: TraceTemplateProps<S>,
) => string

type TracePrint<S extends Record<string, unknown>> = (slot: S) => void

type Level = 'info' | 'warn' | 'error'

type TraceLevel<S extends Record<string, unknown>> = {
    [T in Level]: TracePrint<S>
}

const print_ = (level: Level, message: string) => {
    const report: { [L in Level]: (message: string) => void } = {
        info: (msg) => {
            console.info(msg)
        },
        warn: (msg) => {
            console.warn(msg)
        },
        error: (msg) => {
            console.error(msg)
        },
    }

    report[level](message)
}

type DefaultSlot = { message: string }
const default_template: TraceTemplate<DefaultSlot> = (props) => {
    return props.slot.message
}

export type Trace<S extends Record<string, unknown> = DefaultSlot> = (
    template?: TraceTemplate<S>,
) => TraceLevel<S>

export const createTrace = <S extends Record<string, unknown> = DefaultSlot>(
    enabled: boolean,
) => {
    const enable = (callback: () => void) => {
        if (!enabled) return
        callback()
    }

    const meta: TraceTemplateMeta = {
        level: 'info',
        datetime,
    }

    return <RS extends Record<string, unknown> = S>(
        template?: TraceTemplate<RS>,
    ): TraceLevel<RS> => {
        const tmpl = (template ?? default_template) as TraceTemplate<RS>

        const info: TraceLevel<RS>['info'] = (slot) => {
            const level = 'info'
            enable(() =>
                print_(
                    level,
                    tmpl({
                        meta,
                        slot,
                    }),
                )
            )
        }

        const warn: TraceLevel<RS>['warn'] = (slot) => {
            const level = 'warn'
            enable(() =>
                print_(
                    level,
                    tmpl({
                        meta: { ...meta, level },
                        slot,
                    }),
                )
            )
        }

        const error: TraceLevel<RS>['error'] = (slot) => {
            const level = 'error'
            enable(() =>
                print_(
                    level,
                    tmpl({
                        meta: { ...meta, level },
                        slot,
                    }),
                )
            )
        }

        return { info, warn, error }
    }
}
