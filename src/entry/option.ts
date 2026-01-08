import { DEFAULT_ENABLED, DEFAULT_NAMESPACE, DEFAULT_TRACE } from '../constants'
import { DEFAULT_HANDLE_ERROR, type HandleError } from './error'

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
     * Custom Error Handler
     *
     * Invoked when an error occurs during event emission or collection.
     *
     * @param {Object} error - Error containing target information and error message
     * @param {Object} error.target - Target where the error occurred
     * @param {string} error.target.namespace - Namespace identifier
     * @param {string} error.target.event - Event name
     * @param {string} error.target.unitId - Unique identifier of the HandlerUnit
     * @param {string} error.message - Error description message
     *
     * @example
     * ```ts
     * // The default `handleError`:
     * handleError: ({ target, message }) => {
     *     const formatted = `${target.unitId} <-x- ${message}`
     *     console.error(formatted)
     * }
     * ```
     */
    handleError: HandleError
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
        handleError: DEFAULT_HANDLE_ERROR,
        trace: DEFAULT_TRACE,
    }
    return Object.assign(default_option, option ?? {})
}
