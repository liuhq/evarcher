# evarcher

A type-safe, zero-dependency event manager.

> ESM only

## Installation

> Not yet published!

```sh
npm install evarcher
```

## Usage

### Create Evarcher Instance

file `event.ts`

```ts
import { createEvarcher } from 'evarcher'

// Define your custom events { event-name: data-type }
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

// Register event-handlers
register('open', () => console.log('opened'))
register('report:active', (p) => console.log(`Active: ${p}`))

// Use the same function to register and enable
const sendPos: Handler<MyEvents['send:pos']> = (p) => {
    if (!p) return
    console.log(`Current Position: (${p.x}, ${p.y})`)
}

// call `enable()/disable()` to enable/disable a handler after registering
register('send:pos', sendPos).disable()
enable('send:pos', sendPos)

// Register a run-once event-handler
once('send:message', (p) => console.log(`Message: ${p}`))

// Emit an event with optional-data
emit('open')
emit('send:message', 'Success!')
```

## License

[MIT](./LICENSE)
