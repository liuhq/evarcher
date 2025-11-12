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
export const {
    register,
    once,
    unregister,
    enable,
    disable,
    emit,
} = createEvarcher<MyEvents>({
    // Enable handlers when registering
    defaultEnabled: true,
})
```

### Import to Use

file `main.ts`

```ts
import { Handler } from 'evarcher'
import { emit, enable, once, register } from './event'
import type { MyEvents } from './event'

// Register handlers
register('open', () => console.log('opened'))
register('report:active', (p) => console.log(`Active: ${p}`))

// Use the same handler reference to enable after registering
const sendPos: Handler<MyEvents['send:pos']> = (p) => {
    if (!p) return
    console.log(`Current Position: (${p.x}, ${p.y})`)
}

// Call `enable()/disable()` to enable/disable a handler after registering
register('send:pos', sendPos).disable()

// Enable it later when needed
enable('send:pos', sendPos)

// Register a run-once handler
once('send:message', (p) => console.log(`Message: ${p}`))

// Emit an event with optional-data
emit('open')
emit('send:message', 'Success!')
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

- [`register`](#register)
- [`once`](#once)
- [`unregister`](#unregister)
- [`enable`](#enable)
- [`disable`](#disable)
- [`emit`](#emit)

`Handler`: `(payload: any) => void` - the handler

### register

<!-- dprint-ignore -->
```ts
<K extends keyof E>(event: K, handler: Handler<E[K]>) => RegisterReturn
```

Register a handler to an event. `EvarcherOption.defaultEnabled` controls default to enable or disable.

`RegisterReturn`

- `enable`: `() => void`: Enable the handler immediately
- `disable`: `() => void`: Disable the handler immediately

### once

<!-- dprint-ignore -->
```ts
<K extends keyof E>(event: K, handler: Handler<E[K]>) => RegisterReturn
```

Register a handler which only run once to an event, and then automatically unregisters. `EvarcherOption.defaultEnabled` controls default to enable or disable. Also can immediately enable/disable via `RegisterReturn`

### unregister

<!-- dprint-ignore -->
```ts
<K extends keyof E>(event: K, handler?: Handler<E[K]>) => void
```

Unregister a handler in the event. Match the same handler by function reference, so you must store the handler in a variable.

```ts
const handler = (p) => { ... }

register('clear', handler)
unregister('clear', handler)
```

the `handler` parameter is optional. It means to remove all handlers of the event when pass `event` without `handler`.

```ts
unregister('clear') // remove all handlers of the `clear` event
```

### enable

<!-- dprint-ignore -->
```ts
<K extends keyof E>(event: K, handler?: Handler<E[K]>) => void
```

Enable a handler in the event. Same as `unregister` that it must be passing the handler variable.

```ts
const handler = (p) => { ... }

enable('turn:on', handler)
```

the `handler` parameter is optional, and it means to enable all handlers of the event.

```ts
enable('turn:on') // enable all handlers of the `turn:on` event
```

### disable

<!-- dprint-ignore -->
```ts
<K extends keyof E>(event: K, handler?: Handler<E[K]>) => void
```

Same as `enable`, but disable a/all handler(s) in the event.

### emit

<!-- dprint-ignore -->
```ts
<K extends keyof E>(event: K, payload?: E[K]) => void
```

Emit an event (with an optional data). It will call all enabled handlers of this event.

```ts
emit('run') // call all enabled handlers of the `run` event

emit('report:pos', { x: 1, y: 2 }) // pass data to all enabled handlers
```

## Roadmap

- [ ] Async APIs.
- [ ] Get event and handlers status.
- [ ] Use namespace to manage handlers.
- [ ] Use priority to control the order of handlers.
- [ ] Refactor data struct `HandlerUnit` that evarcher can compare handlers without the variable reference.

## FAQ

Q: What happens if I emit an event with no handlers?

A: Nothing. It's safe and won't throw errors.

Q: Can handlers be async?

A: Yes, but `emit()` won't await them. Use Promises manually if needed.

## License

[MIT](./LICENSE)
