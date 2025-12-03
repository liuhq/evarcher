export type DateTime = {
    date: (separator?: string) => string
    time: (separator?: string) => string
}

export const datetime = (): DateTime => {
    const date = new Date()

    const year = date.getUTCFullYear()
    const month = date.getUTCMonth() + 1
    const day = date.getUTCDate()

    const hour = date.getUTCHours()
    const minute = date.getUTCMinutes()
    const second = date.getUTCSeconds()

    return {
        date: (separator) => {
            const sep = separator ?? '-'
            return `${year}${sep}${month}${sep}${day}`
        },
        time: (separator) => {
            const sep = separator ?? ':'
            return `${hour}${sep}${minute}${sep}${second}`
        },
    }
}
