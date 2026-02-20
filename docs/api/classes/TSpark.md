[**tspark**](../README.md)

***

# Class: TSpark

Defined in: app.ts:20

TSpark Engine Main Class

## Constructors

### Constructor

> **new TSpark**(`setup`): `TSpark`

Defined in: app.ts:35

TSpark Constructor

#### Parameters

##### setup

`Partial`\<[`TSparkSetup`](../interfaces/TSparkSetup.md)\> = `{}`

TSparkSetup

#### Returns

`TSpark`

TSpark instance

## Methods

### createWorld()

> **createWorld**(`name`): `World`

Defined in: app.ts:167

Create a new world

#### Parameters

##### name

`string`

#### Returns

`World`

World

***

### getActiveWorld()

> **getActiveWorld**(): `World`

Defined in: app.ts:152

Get the active world

#### Returns

`World`

World

***

### getDrawCanvas()

> **getDrawCanvas**(): `HTMLCanvasElement`

Defined in: app.ts:144

Get the draw canvas

#### Returns

`HTMLCanvasElement`

HTMLCanvasElement

***

### getFPS()

> **getFPS**(): `number`

Defined in: app.ts:180

Get the current FPS

#### Returns

`number`

number

***

### getRenderer()

> **getRenderer**(): `RendererBackend`

Defined in: app.ts:136

Get the renderer backend

#### Returns

`RendererBackend`

RendererBackend

***

### inject()

> **inject**(`data`): `Promise`\<`void`\>

Defined in: app.ts:75

Inject HTML and CSS into the document

#### Parameters

##### data

###### css?

`string`[]

###### html?

`string`[]

#### Returns

`Promise`\<`void`\>

***

### injectCss()

> **injectCss**(`path`): `Promise`\<`void`\>

Defined in: app.ts:125

Inject CSS into the document head

#### Parameters

##### path

`string`

#### Returns

`Promise`\<`void`\>

***

### injectHtml()

> **injectHtml**(`path`, `position`): `Promise`\<`void`\>

Defined in: app.ts:107

Inject HTML into the document to the draw canvas

#### Parameters

##### path

`string`

##### position

`InsertPosition` = `'beforebegin'`

#### Returns

`Promise`\<`void`\>

***

### isKeyPressed()

> **isKeyPressed**(`code`): `boolean`

Defined in: app.ts:95

The `code` property represents a physical key on the keyboard.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code)

[Event Codes](https://developer.mozilla.org/de/docs/Web/API/UI_Events/Keyboard_event_code_values)

#### Parameters

##### code

`string`

#### Returns

`boolean`

***

### start()

> **start**(): `Promise`\<`void`\>

Defined in: app.ts:187

Start the TSpark engine

#### Returns

`Promise`\<`void`\>

***

### stop()

> **stop**(): `void`

Defined in: app.ts:203

Stop the TSpark engine

#### Returns

`void`

***

### getInstance()

> `static` **getInstance**(): `TSpark`

Defined in: app.ts:67

Get the singleton instance of TSpark

#### Returns

`TSpark`

TSpark instance
