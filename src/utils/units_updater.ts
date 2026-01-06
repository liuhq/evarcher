import type { EventCollection } from '../data/types'
import type { HandlerUnit } from '../data/unit'

export type UpdaterProcessor<
    C extends EventCollection,
    P = HandlerUnit<C, keyof C>,
> = (unit: P) => Partial<P>

export const units_updater_ = <
    C extends EventCollection,
    P extends HandlerUnit<C, keyof C> = HandlerUnit<C, keyof C>,
>(
    units: P[],
) => {
    return {
        at: <PK extends keyof P>(path: [PK, P[PK]] | '*') => {
            return {
                by: (processor: UpdaterProcessor<C>): P[] =>
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
