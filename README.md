# evarcher

A **type-safe**, **zero-dependency** event manager.

> ESM only | full typescript support

## Installation

```sh
npm install evarcher
```

**Requirements:** Node.js >= 16 or modern browsers with ESM support

## Quick Start

### Create Evarcher Instance

file `event.ts`

```ts
import { createEvarcher } from 'evarcher'

// Define your custom events { event: data }
export type MyEvents = {
    open: void
    'send:pos': {
        x: number
        y: number
    }
    'send:message': string
    'report:active': boolean
}

// Export all controls
export const { ns } = createEvarcher<MyEvents>({
    // Enable handlers when registering
    defaultEnabled: true,
})
```

### Import to Use

file `main.ts`

```ts
import { Handler } from 'evarcher'
import { ns } from './event'
import type { MyEvents } from './event'

const myns = ns('myns')

// Register handlers
myns('open').register(() => console.log('opened'))
myns('report:active').register((p) => console.log(`Active: ${p}`))

// Use the same handler reference to enable after registering
const sendPos: Handler<MyEvents['send:pos']> = (p) => {
    console.log(`Current Position: (${p.x}, ${p.y})`)
}
const sendPosEv = myns('send:pos')

// Call `enable()/disable()` to enable/disable a handler after registering
sendPosEv.register(sendPos).disable()

// Enable it later when needed
sendPosEv.enable(sendPos)

// Register a run-once handler
myns('send:message').once((p) => console.log(`Message: ${p}`))

// Emit an event
myns('open').emit()

// Emit an event with data
myns('send:message').emit('Success!')
```

## API

### createEvarcher

<!-- dprint-ignore -->
```ts
<E>(option?: EvarcherOption) => EvarcherReturn<E>
```

Create an evarcher instance to start event management.

`EvarcherOption`

- `defaultEnabled`: `boolean` - If `true`, evarcher enables handlers when registering. Default `false`

`EvarcherReturn`

- [`ns`](#ns)
- [`ev`](#ev)

`Handler<P>`: the handler type

```ts
(...payload: P extends void | undefined ? [payload?: undefined] : [payload: P]) => void
```

### ns

<!-- dprint-ignore -->
```ts
(namespace: string) => EvFn<E>
````

return the event accessor [`ev`](#ev) under this `namespace`

- `namespace`: `string` - Which namespace you want to access

### ev

<!-- dprint-ignore -->
```ts
EvFn<E> = <K extends keyof E>(event: K) => Operator<E, K>
```

- `event`: Which event you want to access

[`Operator`](#operator)

### Operator

`Operator<E, K extends keyof E>`

- [`register`](#register)
- [`once`](#once)
- [`unregister`](#unregister)
- [`enable`](#enable)
- [`disable`](#disable)
- [`emit`](#emit)

#### register

<!-- dprint-ignore -->
```ts
(handler: Handler<E[K]>) => RegisterReturn
````

Register a handler to an event. `EvarcherOption.defaultEnabled` controls default to enable or disable.

`RegisterReturn`

- `enable`: `() => void`: Enable the handler immediately
- `disable`: `() => void`: Disable the handler immediately

#### once

<!-- dprint-ignore -->
```ts
(handler: Handler<E[K]>) => RegisterReturn
```

Register a handler which only run once to an event, and then automatically unregisters. `EvarcherOption.defaultEnabled` controls default to enable or disable. Also can immediately enable/disable via `RegisterReturn`

#### unregister

<!-- dprint-ignore -->
```ts
(handler?: Handler<E[K]>) => void
```

Unregister a handler in the event. Match the same handler by function reference, so you must store the handler in a variable.

```ts
const handler = (p) => { ... }

ev('clear').register(handler)
ev('clear').unregister(handler)
```

the `handler` parameter is optional. It means to remove all handlers of the event when pass `event` without `handler`.

```ts
ev('clear').unregister() // remove all handlers of the `clear` event
```

#### enable

<!-- dprint-ignore -->
```ts
(handler?: Handler<E[K]>) => void
```

Enable a handler in the event. Same as `unregister` that it must be passing the handler variable.

```ts
const handler = (p) => { ... }

ev('turn:on').enable(handler)
```

the `handler` parameter is optional, and it means to enable all handlers of the event.

```ts
ev('turn:on').enable() // enable all handlers of the `turn:on` event
```

#### disable

<!-- dprint-ignore -->
```ts
(handler?: Handler<E[K]>) => void
```

Same as [`enable`](#enable), but disable a/all handler(s) in the event.

#### emit

<!-- dprint-ignore -->
```ts
(...payload: E[K] extends void | undefined
    ? [payload?: undefined]
    : [payload: E[K]]
) => void
```

Emit an event (with an optional data). It will call all enabled handlers of this event.

```ts
ev('run').emit() // call all enabled handlers of the `run` event

ev('report:pos').emit({ x: 1, y: 2 }) // pass data to all enabled handlers
```

## Roadmap

- [ ] Async APIs.
- [ ] Get event and handlers status.
- [x] Use namespace to manage handlers.
- [ ] Use priority to control the order of handlers.
- [ ] Refactor data struct `HandlerUnit` that evarcher can compare handlers without the variable reference.

## FAQ

Q: What happens if I emit an event with no handlers?

A: Nothing. It's safe and won't throw errors.

Q: Can handlers be async?

A: Yes, but `emit()` won't await them. Use Promises manually if needed.

## License

[MIT](./LICENSE)
