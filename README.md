# QuickFetch

> a fetch wrapper like axios, support middlewares

## 1. How to install
```
npm i quickfetch --save
```

## 2. How to use

see `/example/fetchWrapper.js` and `test/QuickFetch.test.js`

## 3. API
<a name="QuickFetch"></a>

## QuickFetch ⇐ <code>MiddlewareHolder</code>
QuickFetch

**Kind**: global class  
**Extends**: <code>MiddlewareHolder</code>  

* [QuickFetch](#QuickFetch) ⇐ <code>MiddlewareHolder</code>
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

<a name="new_QuickFetch_new"></a>

### new QuickFetch([option])
a fetch-based HTTP request tool


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [option] | <code>Object</code> \| <code>null</code> |  | an optional object for Request API |
| [option.baseURL] | <code>string</code> |  | an optional url prefix |
| [option.timeout] | <code>string</code> | <code>30000</code> | an optional timeout |
| [option.catchError] | <code>Boolean</code> | <code>true</code> | optional,   if true then just parse error in middleware, otherwise throw it to endpoint |

<a name="QuickFetch+get"></a>

### quickFetch.get(url, [params], [option]) ⇒ <code>Promise</code>
make a GET fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  |  |
| [params] | <code>Object</code> \| <code>null</code> |  | an optional params object |
| [option] | <code>Object</code> \| <code>null</code> |  | an optional object for Request API |
| [option.baseURL] | <code>string</code> |  | an optional url prefix |
| [option.timeout] | <code>string</code> | <code>30000</code> | an optional timeout |
| [option.catchError] | <code>Boolean</code> | <code>true</code> | optional,   if true then just parse error in middleware, otherwise throw it to endpoint |

<a name="QuickFetch+post"></a>

### quickFetch.post(url, [params], [option]) ⇒ <code>Promise</code>
make a POST fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  |  |
| [params] | <code>Object</code> \| <code>null</code> |  | an optional params object |
| [option] | <code>Object</code> \| <code>null</code> |  | an optional object for Request API |
| [option.baseURL] | <code>string</code> |  | an optional url prefix |
| [option.timeout] | <code>string</code> | <code>30000</code> | an optional timeout |
| [option.catchError] | <code>Boolean</code> | <code>true</code> | optional,   if true then just parse error in middleware, otherwise throw it to endpoint |

<a name="QuickFetch+delete"></a>

### quickFetch.delete(url, [params], [option]) ⇒ <code>Promise</code>
make a DELETE fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  |  |
| [params] | <code>Object</code> \| <code>null</code> |  | an optional params object |
| [option] | <code>Object</code> \| <code>null</code> |  | an optional object for Request API |
| [option.baseURL] | <code>string</code> |  | an optional url prefix |
| [option.timeout] | <code>string</code> | <code>30000</code> | an optional timeout |
| [option.catchError] | <code>Boolean</code> | <code>true</code> | optional,   if true then just parse error in middleware, otherwise throw it to endpoint |

<a name="QuickFetch+put"></a>

### quickFetch.put(url, [params], [option]) ⇒ <code>Promise</code>
make a PUT fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  |  |
| [params] | <code>Object</code> \| <code>null</code> |  | an optional params object |
| [option] | <code>Object</code> \| <code>null</code> |  | an optional object for Request API |
| [option.baseURL] | <code>string</code> |  | an optional url prefix |
| [option.timeout] | <code>string</code> | <code>30000</code> | an optional timeout |
| [option.catchError] | <code>Boolean</code> | <code>true</code> | optional,   if true then just parse error in middleware, otherwise throw it to endpoint |

<a name="QuickFetch+patch"></a>

### quickFetch.patch(url, [params], [option]) ⇒ <code>Promise</code>
make a PATCH fetch

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - a Promise that resolves to a Response object  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  |  |
| [params] | <code>Object</code> \| <code>null</code> |  | an optional params object |
| [option] | <code>Object</code> \| <code>null</code> |  | an optional object for Request API |
| [option.baseURL] | <code>string</code> |  | an optional url prefix |
| [option.timeout] | <code>string</code> | <code>30000</code> | an optional timeout |
| [option.catchError] | <code>Boolean</code> | <code>true</code> | optional,   if true then just parse error in middleware, otherwise throw it to endpoint |

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
| middleware | <code>function</code> | a function looks like '(req|res|err, next) => {}' |
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
