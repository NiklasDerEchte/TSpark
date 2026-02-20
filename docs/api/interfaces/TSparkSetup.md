[**tspark**](../README.md)

***

# Interface: TSparkSetup

Defined in: app.ts:6

## Properties

### canvas?

> `optional` **canvas**: `HTMLCanvasElement`

Defined in: app.ts:8

***

### onAsyncStart()?

> `optional` **onAsyncStart**: () => `Promise`\<`void`\>

Defined in: app.ts:10

#### Returns

`Promise`\<`void`\>

***

### onDrawUpdate()?

> `optional` **onDrawUpdate**: (`worlds`) => `void`

Defined in: app.ts:14

#### Parameters

##### worlds

`World`[]

#### Returns

`void`

***

### onFixedUpdate()?

> `optional` **onFixedUpdate**: () => `void`

Defined in: app.ts:13

#### Returns

`void`

***

### onStart()?

> `optional` **onStart**: () => `void`

Defined in: app.ts:11

#### Returns

`void`

***

### onUpdate()?

> `optional` **onUpdate**: () => `void`

Defined in: app.ts:12

#### Returns

`void`

***

### renderer

> **renderer**: `RendererBackend`

Defined in: app.ts:7

***

### size?

> `optional` **size**: `Dimension`

Defined in: app.ts:9
