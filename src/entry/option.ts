import {
    DEFAULT_ENABLED,
    DEFAULT_NAMESPACE,
    DEFAULT_TRACE,
} from '../constants.ts'
import { DEFAULT_HANDLE_ERROR, type HandleError } from './error.ts'

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
     * Custom error handler for event processing errors.
     *
     * Invoked when an error occurs during event emission or collection. This allows
     * you to implement custom error logging, reporting, or recovery logic.
     *
     * @param {EvarcherError} error - Error object containing target information and error message
     * @param {EvErrorTarget} error.target - Target where the error occurred
     * @param {string} error.target.namespace - Namespace identifier
     * @param {string} error.target.event - Event name
     * @param {string} error.target.unitId - Unique identifier of the handler unit
     * @param {string} error.message - Error description message
     * @returns {void}
     *
     * @example
     * ```ts
     * // Default error handler implementation
     * handleError: ({ target, message }) => {
     *     const formatted = `${target.unitId} <-x- ${message}`
     *     console.error(formatted)
     * }
     * ```
     *
     * @example
     * // Custom error handler with structured logging
     * handleError: ({ target, message }) => {
     *   logger.error('Event handler failed', {
     *     namespace: target.namespace,
     *     event: target.event,
     *     handlerId: target.unitId,
     *     error: message
     *   })
     * }
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
