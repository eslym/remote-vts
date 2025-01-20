# @eslym/capacitor-websocket

Websocket

TODO: add ios implementation

## Install

```bash
npm install @eslym/capacitor-websocket
npx cap sync
```

## API

<docgen-index>

* [`connect(...)`](#connect)
* [`send(...)`](#send)
* [`close(...)`](#close)
* [`addListener(E, ...)`](#addlistenere-)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### connect(...)

```typescript
connect(options: { url: string; }) => Promise<{ id: string; }>
```

| Param         | Type                          |
| ------------- | ----------------------------- |
| **`options`** | <code>{ url: string; }</code> |

**Returns:** <code>Promise&lt;{ id: string; }&gt;</code>

--------------------


### send(...)

```typescript
send(options: { id: string; data: string; }) => Promise<void>
```

| Param         | Type                                       |
| ------------- | ------------------------------------------ |
| **`options`** | <code>{ id: string; data: string; }</code> |

--------------------


### close(...)

```typescript
close(options: { id: string; code?: number; reason?: string; }) => Promise<void>
```

| Param         | Type                                                         |
| ------------- | ------------------------------------------------------------ |
| **`options`** | <code>{ id: string; code?: number; reason?: string; }</code> |

--------------------


### addListener(E, ...)

```typescript
addListener<E extends keyof CapacitorWSEvents>(eventName: E, listenerFunc: (event: CapacitorWSEvents[E]) => void) => void
```

| Param              | Type                                                  |
| ------------------ | ----------------------------------------------------- |
| **`eventName`**    | <code>E</code>                                        |
| **`listenerFunc`** | <code>(event: CapacitorWSEvents[E]) =&gt; void</code> |

--------------------


### Interfaces


#### CapacitorWSEvents

| Prop          | Type                                                       |
| ------------- | ---------------------------------------------------------- |
| **`message`** | <code>{ id: string; data: string; }</code>                 |
| **`open`**    | <code>{ id: string; }</code>                               |
| **`close`**   | <code>{ id: string; code: number; reason: string; }</code> |
| **`error`**   | <code>{ id: string; message: string; }</code>              |

</docgen-api>
