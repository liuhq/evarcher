import { DEFAULT_ENABLED, DEFAULT_NAMESPACE, DEFAULT_TRACE } from '../constants'

export type InternalEvOption = {
    /**
     * Default namespace to use for `ev`
     * @default "DEFAULT_NAMESPACE"
     */
    defaultNamespace: string
    /**
     * Whether the event handlers is enabled by default
     * @default false
     */
    defaultEnabled: boolean
    /**
     * Enable debug tracing logs
     * @default false
     */
    trace: boolean
}

export type EvarcherOption = Partial<InternalEvOption>

export const merge_option = (
    option: EvarcherOption | undefined,
): InternalEvOption => {
    const default_option: InternalEvOption = {
        defaultNamespace: DEFAULT_NAMESPACE,
        defaultEnabled: DEFAULT_ENABLED,
        trace: DEFAULT_TRACE,
    }
    return Object.assign(default_option, option ?? {})
}
