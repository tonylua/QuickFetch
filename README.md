# QuickFetch

> a fetch wrapper like axios, support middlewares & abort

## 1. How to install
```
npm i quickfetch --save
```

## 2. How to use

see `test/QuickFetch.test.js` 

OR [vue-cli-3-preset](https://github.com/tonylua/vue-cli-3-preset/tree/master/template/src/utils/fetchWrapper)

## 3. API
## Classes

<dl>
<dt><a href="#QuickFetch">QuickFetch</a> ⇐ <code><a href="#MiddlewareHolder">MiddlewareHolder</a></code></dt>
<dd><p>QuickFetch</p>
</dd>
<dt><a href="#MiddlewareHolder">MiddlewareHolder</a> ⇐ <code>EventTarget</code></dt>
<dd><p>MiddlewareHolder</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#option">option</a> : <code>Object</code> | <code>Null</code></dt>
<dd><p>an optional object for Request API</p>
</dd>
</dl>

<a name="QuickFetch"></a>

## QuickFetch ⇐ [<code>MiddlewareHolder</code>](#MiddlewareHolder)
QuickFetch

**Kind**: global class  
**Extends**: [<code>MiddlewareHolder</code>](#MiddlewareHolder)  

* [QuickFetch](#QuickFetch) ⇐ [<code>MiddlewareHolder</code>](#MiddlewareHolder)
    * [new QuickFetch([option])](#new_QuickFetch_new)
    * _instance_
        * [.get(url, [params], [option])](#QuickFetch+get) ⇒ <code>Promise</code>
        * [.post(url, [params], [option])](#QuickFetch+post) ⇒ <code>Promise</code>
        * [.delete(url, [params], [option])](#QuickFetch+delete) ⇒ <code>Promise</code>
        * [.put(url, [params], [option])](#QuickFetch+put) ⇒ <code>Promise</code>
        * [.patch(url, [params], [option])](#QuickFetch+patch) ⇒ <code>Promise</code>
        * [.sequence(requestPromiseArr)](#QuickFetch+sequence) ⇒ <code>Array.&lt;Response&gt;</code>
        * [.use(type, middleware, [fetchId])](#MiddlewareHolder+use) ⇒ <code>object</code>
    * _static_
        * [.REQUEST](#QuickFetch.REQUEST)
        * [.RESPONSE](#QuickFetch.RESPONSE)
        * [.ERROR](#QuickFetch.ERROR)
        * [.EXCEPTION_TIMEOUT](#QuickFetch.EXCEPTION_TIMEOUT)
        * [.EVENT_FETCH_ABORT](#QuickFetch.EVENT_FETCH_ABORT)
        * [.abort(id)](#QuickFetch.abort)

<a name="new_QuickFetch_new"></a>

### new QuickFetch([option])
a fetch-based HTTP request tool


| Param | Type |
| --- | --- |
| [option] | [<code>option</code>](#option) | 

<a name="QuickFetch+get"></a>

### quickFetch.get(url, [params], [option]) ⇒ <code>Promise</code>
make a GET fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  
**See**: [QuickFetch#constuctor](QuickFetch#constuctor)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | an optional params object |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+post"></a>

### quickFetch.post(url, [params], [option]) ⇒ <code>Promise</code>
make a POST fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | an optional params object |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+delete"></a>

### quickFetch.delete(url, [params], [option]) ⇒ <code>Promise</code>
make a DELETE fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | an optional params object |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+put"></a>

### quickFetch.put(url, [params], [option]) ⇒ <code>Promise</code>
make a PUT fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | an optional params object |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+patch"></a>

### quickFetch.patch(url, [params], [option]) ⇒ <code>Promise</code>
make a PATCH fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | an optional params object |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+sequence"></a>

### quickFetch.sequence(requestPromiseArr) ⇒ <code>Array.&lt;Response&gt;</code>
make batch requests

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  

| Param | Type |
| --- | --- |
| requestPromiseArr | <code>Array.&lt;Promise&gt;</code> | 

<a name="MiddlewareHolder+use"></a>

### quickFetch.use(type, middleware, [fetchId]) ⇒ <code>object</code>
regist a middleware

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>object</code> - actions - { unuse, pause, resume }  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR |
| middleware | <code>function</code> | a function looks like ```(req|res|err, next) => {}``` |
| [fetchId] | <code>string</code> \| <code>number</code> | a optional id for special requests |

<a name="QuickFetch.REQUEST"></a>

### QuickFetch.REQUEST
**Kind**: static property of [<code>QuickFetch</code>](#QuickFetch)  
<a name="QuickFetch.RESPONSE"></a>

### QuickFetch.RESPONSE
**Kind**: static property of [<code>QuickFetch</code>](#QuickFetch)  
<a name="QuickFetch.ERROR"></a>

### QuickFetch.ERROR
**Kind**: static property of [<code>QuickFetch</code>](#QuickFetch)  
<a name="QuickFetch.EXCEPTION_TIMEOUT"></a>

### QuickFetch.EXCEPTION\_TIMEOUT
**Kind**: static property of [<code>QuickFetch</code>](#QuickFetch)  
<a name="QuickFetch.EVENT_FETCH_ABORT"></a>

### QuickFetch.EVENT\_FETCH\_ABORT
**Kind**: static property of [<code>QuickFetch</code>](#QuickFetch)  
<a name="QuickFetch.abort"></a>

### QuickFetch.abort(id)
cancel a fetch action

**Kind**: static method of [<code>QuickFetch</code>](#QuickFetch)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> \| <code>symbol</code> | fetchId |

<a name="MiddlewareHolder"></a>

## MiddlewareHolder ⇐ <code>EventTarget</code>
MiddlewareHolder

**Kind**: global class  
**Extends**: <code>EventTarget</code>  
<a name="MiddlewareHolder+use"></a>

### middlewareHolder.use(type, middleware, [fetchId]) ⇒ <code>object</code>
regist a middleware

**Kind**: instance method of [<code>MiddlewareHolder</code>](#MiddlewareHolder)  
**Returns**: <code>object</code> - actions - { unuse, pause, resume }  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR |
| middleware | <code>function</code> | a function looks like ```(req|res|err, next) => {}``` |
| [fetchId] | <code>string</code> \| <code>number</code> | a optional id for special requests |

<a name="option"></a>

## option : <code>Object</code> \| <code>Null</code>
an optional object for Request API

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [method] | <code>string</code> |  | standard fetch init option |
| [credentials] | <code>string</code> | <code>&quot;include&quot;</code> | standard fetch init option |
| [mode] | <code>string</code> | <code>&quot;cors&quot;</code> | standard fetch init option |
| [cache] | <code>string</code> | <code>&quot;reload&quot;</code> | standard fetch init option |
| [headers] | <code>Object</code> |  | standard fetch init option |
| [baseURL] | <code>string</code> |  | optional, an url prefix |
| [timeout] | <code>string</code> | <code>30000</code> | optional, timeout |
| [catchError] | <code>boolean</code> | <code>true</code> | optional,   if true then just parse error in middleware, otherwise throw it to endpoint |
| [ignoreBodyMethods] | <code>Array</code> | <code>[&#x27;get&#x27;, &#x27;head&#x27;]</code> | optional |
| [forceJSON] | <code>boolean</code> | <code>false</code> | optional, send body with JSON.stringify() |
| [fetchId] | <code>string</code> \| <code>number</code> \| <code>symbol</code> |  | optional, an unique ID of every fetch request |
| [signal] | <code>AbortSignal</code> |  | optional, a given signal to cancel the fetch request |

