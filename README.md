# QuickFetch

> a fetch wrapper like axios, support middlewares & abort

## 1. How to install
```
npm i quickfetch --save
```

## 2. How to use

see `test/QuickFetch.test.js` 

OR [vue-cli-3-preset](https://github.com/tonylua/vue-cli-3-preset/tree/master/template/src/utils/fetchWrapper)

### to eliminate the "the request of a dependency is an expression" warning

[about the issue](https://github.com/parcel-bundler/parcel/issues/2883)

add below to your webpack config:

```js
// quickfetch uses parcel-bundler which has require statements
new webpack.ContextReplacementPlugin(/quickfetch/, data => {
  delete data.dependencies[0].critical;
  return data;
})
```

## 3. API
## Classes

<dl>
<dt><a href="#QuickFetch">QuickFetch</a> ⇐ <code><a href="#MiddlewareHolder">MiddlewareHolder</a></code></dt>
<dd><p>QuickFetch</p></dd>
<dt><a href="#MiddlewareHolder">MiddlewareHolder</a> ⇐ <code>EventTarget</code></dt>
<dd><p>MiddlewareHolder</p></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#option">option</a> : <code>Object</code> | <code>Null</code></dt>
<dd><p>an optional object for Request API</p></dd>
</dl>

<a name="QuickFetch"></a>

## QuickFetch ⇐ [<code>MiddlewareHolder</code>](#MiddlewareHolder)
<p>QuickFetch</p>

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
        * [.ping(url, [params])](#QuickFetch+ping) ⇒ <code>boolean</code> \| <code>Promise</code>
        * [._getMiddlewares(type, [option])](#MiddlewareHolder+_getMiddlewares)
        * [._parseMiddlewares(mids, target, [params])](#MiddlewareHolder+_parseMiddlewares)
        * [.use(type, middleware, [fetchId])](#MiddlewareHolder+use) ⇒ <code>object</code>
        * [._unuse(id)](#MiddlewareHolder+_unuse)
        * [._pause(id, [fetchId])](#MiddlewareHolder+_pause)
        * [._resume(id, [fetchId])](#MiddlewareHolder+_resume)
    * _static_
        * [.abort(id)](#QuickFetch.abort)

<a name="new_QuickFetch_new"></a>

### new QuickFetch([option])
<p>a fetch-based HTTP request tool</p>


| Param | Type |
| --- | --- |
| [option] | [<code>option</code>](#option) | 

<a name="QuickFetch+get"></a>

### quickFetch.get(url, [params], [option]) ⇒ <code>Promise</code>
<p>make a GET fetch</p>

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - <p>a Promise that resolves to a Response object</p>  
**See**: [QuickFetch#constuctor](QuickFetch#constuctor)  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | <p>an optional params object</p> |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+post"></a>

### quickFetch.post(url, [params], [option]) ⇒ <code>Promise</code>
<p>make a POST fetch</p>

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - <p>a Promise that resolves to a Response object</p>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | <p>an optional params object</p> |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+delete"></a>

### quickFetch.delete(url, [params], [option]) ⇒ <code>Promise</code>
<p>make a DELETE fetch</p>

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - <p>a Promise that resolves to a Response object</p>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | <p>an optional params object</p> |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+put"></a>

### quickFetch.put(url, [params], [option]) ⇒ <code>Promise</code>
<p>make a PUT fetch</p>

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - <p>a Promise that resolves to a Response object</p>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | <p>an optional params object</p> |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+patch"></a>

### quickFetch.patch(url, [params], [option]) ⇒ <code>Promise</code>
<p>make a PATCH fetch</p>

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>Promise</code> - <p>a Promise that resolves to a Response object</p>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | <p>an optional params object</p> |
| [option] | [<code>option</code>](#option) |  |

<a name="QuickFetch+sequence"></a>

### quickFetch.sequence(requestPromiseArr) ⇒ <code>Array.&lt;Response&gt;</code>
<p>make batch requests</p>

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  

| Param | Type |
| --- | --- |
| requestPromiseArr | <code>Array.&lt;Promise&gt;</code> | 

<a name="QuickFetch+ping"></a>

### quickFetch.ping(url, [params]) ⇒ <code>boolean</code> \| <code>Promise</code>
<p>send a beacon</p>

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Returns**: <code>boolean</code> \| <code>Promise</code> - <p>send result</p>  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> |  |
| [params] | <code>Object</code> \| <code>null</code> | <p>an optional params object</p> |

<a name="MiddlewareHolder+_getMiddlewares"></a>

### quickFetch.\_getMiddlewares(type, [option])
**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Overrides**: [<code>\_getMiddlewares</code>](#MiddlewareHolder+_getMiddlewares)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | <p>QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR</p> |
| [option] | <code>Object</code> |  |

<a name="MiddlewareHolder+_parseMiddlewares"></a>

### quickFetch.\_parseMiddlewares(mids, target, [params])
**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Overrides**: [<code>\_parseMiddlewares</code>](#MiddlewareHolder+_parseMiddlewares)  
**Access**: protected  

| Param | Type | Default |
| --- | --- | --- |
| mids | <code>Array</code> |  | 
| target | <code>Request</code> \| <code>Response</code> \| <code>JSON</code> \| <code>Blob</code> |  | 
| [params] | <code>Object</code> | <code></code> | 

<a name="MiddlewareHolder+use"></a>

### quickFetch.use(type, middleware, [fetchId]) ⇒ <code>object</code>
<p>regist a middleware</p>

**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Overrides**: [<code>use</code>](#MiddlewareHolder+use)  
**Returns**: <code>object</code> - <p>actions - { unuse, pause, resume }</p>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | <p>QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR</p> |
| middleware | <code>function</code> | <p>a function looks like <code>(req|res|err, next) =&gt; {}</code></p> |
| [fetchId] | <code>string</code> \| <code>number</code> | <p>a optional id for special requests</p> |

<a name="MiddlewareHolder+_unuse"></a>

### quickFetch.\_unuse(id)
**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Overrides**: [<code>\_unuse</code>](#MiddlewareHolder+_unuse)  
**Access**: protected  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 

<a name="MiddlewareHolder+_pause"></a>

### quickFetch.\_pause(id, [fetchId])
**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Overrides**: [<code>\_pause</code>](#MiddlewareHolder+_pause)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> |  |
| [fetchId] | <code>string</code> \| <code>number</code> | <p>a optional id for special requests</p> |

<a name="MiddlewareHolder+_resume"></a>

### quickFetch.\_resume(id, [fetchId])
**Kind**: instance method of [<code>QuickFetch</code>](#QuickFetch)  
**Overrides**: [<code>\_resume</code>](#MiddlewareHolder+_resume)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> |  |
| [fetchId] | <code>string</code> \| <code>number</code> | <p>a optional id for special requests</p> |

<a name="QuickFetch.abort"></a>

### QuickFetch.abort(id)
<p>cancel a fetch action</p>

**Kind**: static method of [<code>QuickFetch</code>](#QuickFetch)  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> \| <code>number</code> \| <code>symbol</code> | <p>fetchId</p> |

<a name="MiddlewareHolder"></a>

## MiddlewareHolder ⇐ <code>EventTarget</code>
<p>MiddlewareHolder</p>

**Kind**: global class  
**Extends**: <code>EventTarget</code>  

* [MiddlewareHolder](#MiddlewareHolder) ⇐ <code>EventTarget</code>
    * [._getMiddlewares(type, [option])](#MiddlewareHolder+_getMiddlewares)
    * [._parseMiddlewares(mids, target, [params])](#MiddlewareHolder+_parseMiddlewares)
    * [.use(type, middleware, [fetchId])](#MiddlewareHolder+use) ⇒ <code>object</code>
    * [._unuse(id)](#MiddlewareHolder+_unuse)
    * [._pause(id, [fetchId])](#MiddlewareHolder+_pause)
    * [._resume(id, [fetchId])](#MiddlewareHolder+_resume)

<a name="MiddlewareHolder+_getMiddlewares"></a>

### middlewareHolder.\_getMiddlewares(type, [option])
**Kind**: instance method of [<code>MiddlewareHolder</code>](#MiddlewareHolder)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>String</code> | <p>QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR</p> |
| [option] | <code>Object</code> |  |

<a name="MiddlewareHolder+_parseMiddlewares"></a>

### middlewareHolder.\_parseMiddlewares(mids, target, [params])
**Kind**: instance method of [<code>MiddlewareHolder</code>](#MiddlewareHolder)  
**Access**: protected  

| Param | Type | Default |
| --- | --- | --- |
| mids | <code>Array</code> |  | 
| target | <code>Request</code> \| <code>Response</code> \| <code>JSON</code> \| <code>Blob</code> |  | 
| [params] | <code>Object</code> | <code></code> | 

<a name="MiddlewareHolder+use"></a>

### middlewareHolder.use(type, middleware, [fetchId]) ⇒ <code>object</code>
<p>regist a middleware</p>

**Kind**: instance method of [<code>MiddlewareHolder</code>](#MiddlewareHolder)  
**Returns**: <code>object</code> - <p>actions - { unuse, pause, resume }</p>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | <p>QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR</p> |
| middleware | <code>function</code> | <p>a function looks like <code>(req|res|err, next) =&gt; {}</code></p> |
| [fetchId] | <code>string</code> \| <code>number</code> | <p>a optional id for special requests</p> |

<a name="MiddlewareHolder+_unuse"></a>

### middlewareHolder.\_unuse(id)
**Kind**: instance method of [<code>MiddlewareHolder</code>](#MiddlewareHolder)  
**Access**: protected  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 

<a name="MiddlewareHolder+_pause"></a>

### middlewareHolder.\_pause(id, [fetchId])
**Kind**: instance method of [<code>MiddlewareHolder</code>](#MiddlewareHolder)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> |  |
| [fetchId] | <code>string</code> \| <code>number</code> | <p>a optional id for special requests</p> |

<a name="MiddlewareHolder+_resume"></a>

### middlewareHolder.\_resume(id, [fetchId])
**Kind**: instance method of [<code>MiddlewareHolder</code>](#MiddlewareHolder)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>number</code> |  |
| [fetchId] | <code>string</code> \| <code>number</code> | <p>a optional id for special requests</p> |

<a name="option"></a>

## option : <code>Object</code> \| <code>Null</code>
<p>an optional object for Request API</p>

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [method] | <code>string</code> |  | <p>standard fetch init option</p> |
| [credentials] | <code>string</code> | <code>&quot;include&quot;</code> | <p>standard fetch init option</p> |
| [mode] | <code>string</code> | <code>&quot;cors&quot;</code> | <p>standard fetch init option</p> |
| [cache] | <code>string</code> | <code>&quot;reload&quot;</code> | <p>standard fetch init option</p> |
| [headers] | <code>Object</code> |  | <p>standard fetch init option</p> |
| [endpoint] | <code>string</code> |  | <p>optional, e.g. http://xxx.com:8090</p> |
| [baseURL] | <code>string</code> |  | <p>optional, an url prefix, e.g. /myapi</p> |
| [timeout] | <code>string</code> | <code>30000</code> | <p>optional, timeout</p> |
| [catchError] | <code>boolean</code> | <code>true</code> | <p>optional, if true then just parse error in middleware, otherwise throw it to endpoint</p> |
| [ignoreBodyMethods] | <code>Array</code> | <code>[&#x27;get&#x27;, &#x27;head&#x27;]</code> | <p>optional</p> |
| [forceJSON] | <code>boolean</code> | <code>false</code> | <p>optional, send body with JSON.stringify()</p> |
| [fetchId] | <code>string</code> \| <code>number</code> \| <code>symbol</code> |  | <p>optional, an unique ID of every fetch request</p> |
| [signal] | <code>AbortSignal</code> |  | <p>optional, a given signal to cancel the fetch request</p> |

