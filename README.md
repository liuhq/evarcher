# evarcher

A **type-safe**, **zero-dependency** event manager.

> ESM only | full typescript support

## Installation

```sh
npm install evarcher
```

**Requirements:** Node.js >= 16 or modern browsers with ESM support.

## Simple Example

```ts
import { createEvarcher } from 'evarcher'

type MyEvents = { greet: string }
const { ev } = createEvarcher<MyEvents>({ defaultEnabled: true })

ev('greet').register((name) => console.log(`Hello, ${name}!`))
ev('greet').emit('World') // Output: Hello, World!
```

## Quick Start

Just create and export an instance, then import to use it!

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

// Export ns & ev
export const { ns, ev } = createEvarcher<MyEvents>({
    // Enable handlers when registering
    defaultEnabled: true,
})
```

### Import to Use

file `main.ts`

```ts
import { Handler } from 'evarcher'
import { ev, ns } from './event'
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

// the ev usage same as ns, but the events will be
// managed by the default namespace.
const openEv = ev('open')
openEv.register(() => console.log('opened'))
openEv.emit()
```

## Core Concepts

### Namespace

Namespaces help organize events in multi-layer structured projects by creating isolated event scopes. This prevents naming conflicts and improves code organization.

```ts
// Different modules can use the same event names
const authNs = ns('auth')
const uiNs = ns('ui')

authNs('login').register(handleAuthLogin)
uiNs('login').register(handleUILogin) // No conflict!
```

**When to use:**

- Use `ev` for simple cases (uses the default namespace)
- Use `ns` when you need event isolation or logical grouping

### Handler States

Handlers can be in two states:

- Enabled: Will be called when the event is emitted
- Disabled: Registered but won't be called (useful for temporary muting)

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

- [`ns`](#ns): the namespace manager.
- [`ev`](#evfn): the event manager in the default namespace.

### `Handler<P>`

A function that handles event data of type `P`.

- For events with data: `(payload: P) => void`
- For events without data: `() => void` or `(payload?: undefined) => void`

### ns

<!-- dprint-ignore -->
```ts
(namespace: string) => EvFn<E>
```

return the event manager [`ev`](#ev) under a `namespace`.

- `namespace`: `string` - Which namespace to manage.

### EvFn

<!-- dprint-ignore -->
```ts
EvFn<E> = <K extends keyof E>(event: K) => Operator<E, K>
```

the event manager.

- `event`: Which event to manage.

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
```

Register a handler to an event. `EvarcherOption.defaultEnabled` controls whether the handler is enabled by default.

Returns a `RegisterReturn` object for immediate state control:

`RegisterReturn`

- `enable`: `() => void`: Enable the handler immediately
- `disable`: `() => void`: Disable the handler immediately

**Example:**

```ts
// Register and immediately disable
const saveReg = ev('save').register(handleSave)
saveReg.disable()

// ...

// Later: enable it
saveReg.enable()
```

#### once

<!-- dprint-ignore -->
```ts
(handler: Handler<E[K]>) => RegisterReturn
```

Register a handler that runs only once, then automatically unregisters itself. `EvarcherOption.defaultEnabled` controls whether the handler is enabled by default. You can also immediately enable/disable via `RegisterReturn`.

#### unregister

<!-- dprint-ignore -->
```ts
(handler?: Handler<E[K]>) => void
```

Unregister and remove a handler in the event. Match the same handler by function reference, so you must store the handler in a variable.

```ts
const handler = (p) => { ... }

ev('clear').register(handler)
ev('clear').unregister(handler)
```

the `handler` parameter is optional. It means to remove all handlers of the event.

```ts
ev('clear').unregister() // remove all handlers of the `clear` event
```

#### enable

<!-- dprint-ignore -->
```ts
(handler?: Handler<E[K]>) => void
```

Enable a handler in the event. Same as `unregister`, you must pass the handler variable.

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

Same as [`enable`](#enable), but disables one or all handlers in the event.

#### emit

<!-- dprint-ignore -->
```ts
(...payload: E[K] extends void | undefined
    ? [payload?: undefined]
    : [payload: E[K]]
) => void
```

Emit an event with optional data. This calls all enabled handlers synchronously in registration order.

```ts
ev('run').emit() // call all enabled handlers of the `run` event

ev('report:pos').emit({ x: 1, y: 2 }) // pass data to all enabled handlers
```

> **Note:** Handlers are executed synchronously. Async handlers will start execution but won't be awaited by emit().

## FAQ

**Q: What happens if I emit an event with no handlers?**

A: Nothing. It's safe and won't throw errors.

**Q: Can handlers be async?**

A: Yes, but `emit()` won't await them. Use Promises manually if needed.

**Q: How do I handle errors in handlers?**

A: Wrap your handler logic in try-catch blocks, as evarcher doesn't catch errors.

```ts
ev('process').register((data) => {
    try {
        processData(data)
    } catch (error) {
        console.error('Handler error:', error)
    }
})
```

## License

[MIT](./LICENSE)
