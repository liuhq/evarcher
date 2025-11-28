export class ExtendMap<K, V> extends Map<K, V> {
    constructor(items?: Iterable<readonly [K, V]>) {
        if (items) {
            super(items)
            return
        }

        super()
    }

    static from<K, V>(items: Iterable<readonly [K, V]>): ExtendMap<K, V> {
        return new this(items)
    }

    clone(): ExtendMap<K, V> {
        return ExtendMap.from(this)
    }

    get_or(
        key: K,
        initializer: V,
    ): V {
        if (this.get(key) === undefined) this.set(key, initializer)

        return this.get(key)!
    }
}
