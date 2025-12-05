import type { HandlerUnit } from '../data/unit'

export type UpdaterProcessor<
    P = HandlerUnit<unknown, keyof unknown>,
> = (unit: P) => Partial<P>

export const units_updater_ = <
    E,
    P extends HandlerUnit<unknown, never> = HandlerUnit<E, keyof E>,
>(
    units: P[],
) => {
    return {
        at: <PK extends keyof P>(path: [PK, P[PK]] | '*') => {
            return {
                by: (processor: UpdaterProcessor): P[] =>
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
