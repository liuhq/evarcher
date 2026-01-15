<!-- dprint-ignore-start -->
<!-- omit from toc -->
# evarcher
<!-- dprint-ignore-end -->

A **type-safe**, **zero-dependency** event manager.

> ESM only | full typescript support

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [API](#api)
  - [createEvarcher](#createevarcher)
  - [ns](#ns)
  - [`EvFn`](#evfn)
  - [Operator](#operator)
    - [register](#register)
    - [once](#once)
    - [unregister](#unregister)
    - [enable](#enable)
    - [disable](#disable)
    - [emit](#emit)
    - [collect](#collect)
    - [Parallel \& Serial](#parallel--serial)
  - [Types](#types)
    - [`EventCollection`](#eventcollection)
    - [`EventConfig`](#eventconfig)
    - [`DefineEvents`](#defineevents)
    - [`Handler<E extends EventConfig>`](#handlere-extends-eventconfig)
    - [EvarcherError](#evarchererror)

## Installation

```sh
npm install evarcher
```

**Requirements**: Node.js >= 20 or modern browsers with ESM support.

## Quick Start

Create and export an evarcher instance, then import it wherever you need event management.

<!-- dprint-ignore-start -->
<!-- omit from toc -->
### Create Evarcher Instance
<!-- dprint-ignore-end -->

file `event.ts`

```ts
import type { DefineEvents } from 'evarcher'
import { createEvarcher } from 'evarcher'

// Define your custom events via the DefineEvents helper
export type MyEvents = DefineEvents<{
    open: {
        payload: string
        result: void
    }
    'send:pos': {
        payload: {
            x: number
            y: number
        }
        result: number[]
    }
    'send:message': {
        payload: string
        result: void
    }
    'report:active': {
        payload: boolean
        result: {
            target: string
            message: string
        }
    }
}>

// Export ns & ev
export const { ns, ev } = createEvarcher<MyEvents>({
    // Enable handlers when registering
    defaultEnabled: true,
})
```

<!-- dprint-ignore-start -->
<!-- omit from toc -->
### Import to Use
<!-- dprint-ignore-end -->

file `main.ts`

```ts
import { Handler } from 'evarcher'
import { ev, ns } from './event'
import type { MyEvents } from './event'

const myns = ns('myns')

// Register a handler and get its id
const openId = myns('open').register(() => console.log('opened')).id
const raId = myns('report:active')
    .register((p) => ({ target: 'rock', message: 'Activated' }))
    .id

// Unregister handlers via id
myns('open').unregister(openId)
myns('report:active').unregister(raId)

// Use the same handler reference to enable after registering
const sendPos: Handler<MyEvents['send:pos']> = (p) => {
    console.log(`Current Position: (${p.x}, ${p.y})`)
    return [p.x, p.y]
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

// Collect the results
const result = myns('report:active').collect(true)

// ev is used the same way as ns, but events will be
// managed by the default namespace.
const openEv = ev('open')
openEv.register(() => console.log('opened'))
openEv.emit()
```

## Core Concepts

<!-- dprint-ignore-start -->
<!-- omit from toc -->
### Namespace
<!-- dprint-ignore-end -->

Namespaces help organize events in multi-layered projects by creating isolated event scopes. This prevents naming conflicts and improves code organization.

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

<!-- dprint-ignore-start -->
<!-- omit from toc -->
### Handler States
<!-- dprint-ignore-end -->

Handlers can be in two states:

- Enabled: Will be executed when the event is emitted
- Disabled: Registered but won't be executed (useful for temporary muting)

## API

### createEvarcher

<!-- dprint-ignore -->
```ts
<C extends EventCollection>(option?: EvarcherOption) => EvarcherReturn
```

Create an evarcher instance to start event management.

`EvarcherOption`

- `defaultNamespace`: `string` - The namespace to use for `ev`. Default `"DEFAULT_NAMESPACE"`
- `defaultEnabled`: `boolean` - If `true`, handlers are enabled immediately upon registration. Default: `false`
- `handleError`: [`(error: EvarcherError) => void`](#evarchererror) - The custom error handler that will be invoked when an error occurs during event emission or collection
- `trace`: `boolean` - Enables debug tracing logs

`EvarcherReturn`

- `DEFAULT_NAMESPACE`: `readonly string` - The default namespace name used by `ev`.
- [`ns`](#ns): The namespace manager.
- [`ev`](#evfn): The event manager in the default namespace. Equal to `ns(DEFAULT_NAMESPACE)`.

**Example with custom default namespace:**

```ts
const { ns, ev, DEFAULT_NAMESPACE } = createEvarcher<MyEvents>({
    defaultNamespace: 'app',
    defaultEnabled: true,
})

console.log(DEFAULT_NAMESPACE) // Output: 'app'

// ev uses 'app' namespace
ev('open').register(() => console.log('opened'))

// Equivalent to:
ns('app')('open').register(() => console.log('opened'))
// or
ns(DEFAULT_NAMESPACE)('open').register(() => console.log('opened'))
```

### ns

<!-- dprint-ignore -->
```ts
(namespace: string) => EvFn
```

Returns the event manager [`ev`](#evfn) under a specified `namespace`.

- `namespace`: `string` - The namespace to manage.

### `EvFn`

<!-- dprint-ignore -->
```ts
EvFn<C extends EventCollection> = <K extends keyof C>(event: K) => Operator
```

The event manager.

- `event`: The event name to manage.

[`Operator`](#operator)

### Operator

`Operator<C extends EventCollection, K extends keyof C>`

<!-- dprint-ignore-start -->
<!-- no toc -->
- [`register`](#register)
- [`once`](#once)
- [`unregister`](#unregister)
- [`enable`](#enable)
- [`disable`](#disable)
- [`emit`](#emit)
- [`collect`](#collect)
- [`parallel & serial`](#parallel--serial)
<!-- dprint-ignore-end -->

#### register

<!-- dprint-ignore -->
```ts
(handler: Handler) => RegisterReturn
```

Register a handler for an event. `EvarcherOption.defaultEnabled` controls whether the handler is enabled by default.

Returns a `RegisterReturn` object for immediate state control:

`RegisterReturn`

- `id`: `string` - The id of the registered handler
- `enable`: `() => void` - Enable the handler immediately
- `disable`: `() => void` - Disable the handler immediately

**Example:**

```ts
// Register and immediately disable
const saveReg = ev('save').register(handleSave)
saveReg.disable()

// ...

// Later: enable it
saveReg.enable()

// unregister via id
ev('save').unregister(saveReg.id)
```

#### once

<!-- dprint-ignore -->
```ts
(handler: Handler) => RegisterReturn
```

Register a handler that runs only once, then automatically unregisters itself. `EvarcherOption.defaultEnabled` controls whether the handler is enabled by default. You can also immediately enable/disable via `RegisterReturn`.

**Example:**

```ts
// Handler runs once then auto-removes
ev('init').once(() => console.log('Initialized!')).enable()

ev('init').emit() // Output: Initialized!
ev('init').emit() // No output (already removed)
```

#### unregister

<!-- dprint-ignore -->
```ts
(handler: Handler) => void
(id: string) => void
() => void
```

Unregister and remove a handler for the event. Match the handler by function reference or the id obtained from `register` / `once`.

```ts
const handler = (p) => { ... }

const handlerId = ev('clear').register(handler).id

// unregister via function reference
ev('clear').unregister(handler)
// unregister via id
ev('clear').unregister(handlerId)
```

The `handler` parameter is optional. When omitted, all handlers of the event will be removed.

```ts
ev('clear').unregister() // remove all handlers of the `clear` event
```

#### enable

<!-- dprint-ignore -->
```ts
(handler: Handler) => void
(id: string) => void
() => void
```

Enable a handler for the event. Accepts the same parameter types as `unregister` (handler function, id, or none for all).

```ts
const handler = (p) => { ... }

const handlerId = ev('turn:on').register(handler).id

// enable via function reference
ev('turn:on').enable(handler)
// enable via id
ev('turn:on').enable(handlerId)
```

The `handler` parameter is optional. When omitted, all handlers of the event will be enabled.

```ts
ev('turn:on').enable() // enable all handlers of the `turn:on` event
```

#### disable

<!-- dprint-ignore -->
```ts
(handler: Handler) => void
(id: string) => void
() => void
```

Disable a handler for the event. Accepts the same parameter types as [`enable`](#enable) (handler function, id, or none for all).

#### emit

<!-- dprint-ignore -->
```ts
(payload: C[K]['payload']) => void
```

Emit an event with optional data. This calls all enabled handlers synchronously in registration order.

```ts
ev('run').emit() // Call all enabled handlers of the `run` event

ev('report:pos').emit({ x: 1, y: 2 }) // Pass data to all enabled handlers
```

> **Note:** Handlers are executed synchronously. Async handlers will start execution but won't be awaited by `emit()`.

#### collect

<!-- dprint-ignore -->
```ts
(payload: C[K]['payload']) => Array<C[K]['result']>
```

Emit an event with optional data, then collect all results from called handlers into an array. This calls all enabled handlers synchronously in registration order.

```ts
const results = ev('run').collect() // Call all enabled handlers of the `run` event, then collect all results to an array

const resultsWithData = ev('report:pos').collect({ x: 1, y: 2 }) // Pass data to all enabled handlers and collect results
```

> **Note:** Handlers are executed synchronously. Async handlers will start execution but won't be awaited by `collect()`.

#### Parallel & Serial

Both `parallel` and `serial` include `emit` and `collect` functions. They call all handlers asynchronously.

```ts
ev('run').parallel.emit()
ev('run').serial.emit()

ev('run').parallel.collect({ x: 1, y: 2 })
ev('run').serial.collect({ x: 1, y: 2 })
```

### Types

#### `EventCollection`

```ts
type EventCollection = Record<string, EventConfig>
```

A collection of `EventConfig` objects.

#### `EventConfig`

```ts
interface EventConfig {
    payload: any
    result: any
}
```

An event type that includes payload and result.

#### `DefineEvents`

The helper for defining a type-safe collection of events.

```ts
type MyEvents = DefineEvents<{
    open: {
        payload: string
        result: void
    }
    pos: {
        payload: {
            x: number
            y: number
        }
        result: number[]
    }
}>
```

#### `Handler<E extends EventConfig>`

A function that handles event data of type `E['payload']` and returns data of type `E['result']`.

- For events with data: `(payload: E['payload']) => E['result']`
- For events without data: `() => E['result']` or `(payload?: undefined) => E['result']`

#### EvarcherError

An error object containing target information and error message.

`EvarcherError`:

- `target`: `EvErrorTarget` - Target where the error occurred
- `message`: `string` - Error description message

`EvErrorTarget`:

- `namespace`: `string` - Namespace identifier
- `event`: `string` - Event name
- `unitId`: `HandlerUnit['id']` - Unique identifier of the HandlerUnit

<!-- dprint-ignore-start -->
<!-- omit from toc -->
## License

[MIT](./LICENSE)
<!-- dprint-ignore-end -->
