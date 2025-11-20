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
