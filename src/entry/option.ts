import { DEFAULT_NAMESPACE } from '../constants'

export type InternalEvOption = {
    /** WIP */
    id: number
    /** WIP */
    tag: boolean
    /** WIP */
    defaultNamespace: string
    /** default enabled, or not: false */
    defaultEnabled: boolean
    trace: boolean
}

export type EvarcherOption = Partial<Pick<InternalEvOption, 'defaultEnabled'>>

export const merge_option = (
    option: EvarcherOption | undefined,
): InternalEvOption => {
    const default_option: InternalEvOption = {
        id: 0,
        tag: false,
        defaultNamespace: DEFAULT_NAMESPACE,
        defaultEnabled: false,
        trace: false,
    }
    return Object.assign(default_option, option ?? {})
}
