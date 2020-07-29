declare class CustomError extends Error {
    data: any;
    constructor(message: string, data: any);
}
export default CustomError;
,import { QFMidFn, QFMidTypes, QFOption, QFCloneable, QFFetchID, QFUseReturnType } from "./quickfetch";
/**
 * MiddlewareHolder
 * @extends EventTarget
 */
declare class MiddlewareHolder extends EventTarget {
    private _midIdFlag;
    private _mids;
    constructor();
    /**
     * @protected
     * @param {String} type - QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR
     * @param {Object} [option]
     */
    protected _getMiddlewares(type: QFMidTypes, option: QFOption): Array<QFMidFn>;
    /**
     * @protected
     * @param {Array} mids
     * @param {Request|Response|JSON|Blob} target
     * @param {Object} [params = null]
     */
    protected _parseMiddlewares(mids: Array<QFMidFn>, target: QFCloneable, params?: any): Promise<unknown>;
    /**
     * regist a middleware
     * @param {string} type - QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR
     * @param {function} middleware - a function looks like ```(req|res|err, next) => {}```
     * @param {string|number} [fetchId] - a optional id for special requests
     * @returns {object} actions - { unuse, pause, resume }
     */
    use(type: QFMidTypes, middleware: QFMidFn, fetchId: QFFetchID): QFUseReturnType;
    /**
     * @protected
     * unregist a middleware
     * @param {number} id
     */
    protected _unuse(id: number): void;
    /**
     * @protected
     * pause a middleware
     * @param {number} id
     * @param {string|number} [fetchId] - a optional id for special requests
     */
    protected _pause(id: number, fetchId: QFFetchID): void;
    /**
     * @protected
     * resume a paused middleware
     * @param {number} id
     * @param {string|number} [fetchId] - a optional id for special requests
     */
    protected _resume(id: number, fetchId: QFFetchID): void;
}
export default MiddlewareHolder;
,import { QFOption } from "./quickfetch";
declare class OptRequest extends Request {
    init: QFOption;
    constructor(req: string | Request, init: QFOption);
    clone(): OptRequest;
}
export default OptRequest;
,import MiddlewareHolder from "./MiddlewareHolder";
import { QFFetchID, QFOption, QFDoReqFn } from "./quickfetch";
/**
 * an optional object for Request API
 * @typedef {Object|Null} option
 * @property {string} [method] standard fetch init option
 * @property {string} [credentials = include] standard fetch init option
 * @property {string} [mode = cors] standard fetch init option
 * @property {string} [cache = reload] standard fetch init option
 * @property {Object} [headers] standard fetch init option
 * @property {string} [endpoint] - optional, e.g. http://xxx.com:8090
 * @property {string} [baseURL] - optional, an url prefix, e.g. /myapi
 * @property {string} [timeout     = 30000] - optional, timeout
 * @property {boolean} [catchError = true] - optional,
 *  if true then just parse error in middleware, otherwise throw it to endpoint
 * @property {Array} [ignoreBodyMethods = ['get', 'head']] optional
 * @property {boolean} [forceJSON = false] optional, send body with JSON.stringify()
 * @property {string|number|symbol} [fetchId] optional, an unique ID of every fetch request
 * @property {AbortSignal} [signal] optional, a given signal to cancel the fetch request
 */
/**
 * QuickFetch
 * @extends MiddlewareHolder
 */
export default class QuickFetch extends MiddlewareHolder {
    /**
     * @memberof QuickFetch
     * @static
     */
    static readonly REQUEST: string;
    /**
     * @memberof QuickFetch
     * @static
     */
    static readonly RESPONSE: string;
    /**
     * @memberof QuickFetch
     * @static
     */
    static readonly ERROR: string;
    /**
     * @memberof QuickFetch
     * @static
     */
    static readonly EXCEPTION_TIMEOUT: string;
    /**
     * @memberof QuickFetch
     * @static
     */
    static readonly EVENT_FETCH_ABORT: string;
    /**
     * cancel a fetch action
     * @static
     * @param {string|number|symbol} id - fetchId
     */
    static abort(id: QFFetchID): void;
    private _globalOption;
    private _originFetch;
    /**
     * QuickFetch constructor
     * @description a fetch-based HTTP request tool
     * @class
     * @param {option} [option]
     */
    constructor(option: QFOption);
    /**
     * @private
     * @param {OptRequest} req
     * @param {object} [option]
     */
    private _parseRequestMiddlewares;
    /**
     * @private
     * @param {Response} res
     * @param {object} [option]
     */
    private _parseResponseMiddlewares;
    /**
     * @private
     * @param {Error} err
     * @param {object} [option]
     */
    private _parseErrorMiddlewares;
    /**
     * @private
     * @param {string} method - a HTTP verb
     * @param {function} a function to execute the real HTTP verb
     */
    private _doRequest;
    /**
     * make a GET fetch
     * @param {string} url
     * @param {Object|null} [params] - an optional params object
     * @param {option} [option]
     * @see {@link QuickFetch#constuctor}
     * @returns {Promise} a Promise that resolves to a Response object
     */
    get(...args: keyof QFDoReqFn): Promise<any>;
    /**
     * make a POST fetch
     * @param {string} url
     * @param {Object|null} [params] - an optional params object
     * @param {option} [option]
     * @returns {Promise} a Promise that resolves to a Response object
     */
    post(...args: keyof QFDoReqFn): Promise<any>;
    /**
     * make a DELETE fetch
     * @param {string} url
     * @param {Object|null} [params] - an optional params object
     * @param {option} [option]
     * @returns {Promise} a Promise that resolves to a Response object
     */
    delete(...args: keyof QFDoReqFn): Promise<any>;
    /**
     * make a PUT fetch
     * @param {string} url
     * @param {Object|null} [params] - an optional params object
     * @param {option} [option]
     * @returns {Promise} a Promise that resolves to a Response object
     */
    put(...args: keyof QFDoReqFn): Promise<any>;
    /**
     * make a PATCH fetch
     * @param {string} url
     * @param {Object|null} [params] - an optional params object
     * @param {option} [option]
     * @returns {Promise} a Promise that resolves to a Response object
     */
    patch(...args: keyof QFDoReqFn): Promise<any>;
    /**
     * make batch requests
     * @param {Promise[]} requestPromiseArr
     * @returns {Response[]}
     */
    sequence(requestPromiseArr: Array<Promise<any>>): Promise<Promise<any>[]>;
}
,import OptRequest from "./OptRequest";
import { QFHeaders, QFOption, QFCloneable } from "./quickfetch";
export declare function _getLatestHeaders(request: OptRequest): QFHeaders;
export declare function _cloneObject(target: QFCloneable): QFCloneable;
export declare function _getDefaultFetchId(): symbol;
export declare function _isValidFetchId(fetchId?: string | number | symbol): number | boolean;
export declare function _formatHeaders(option: QFOption): void;
export declare function _parseBody(option: QFOption, method: string, params: any): void;
export declare function _getURL(option: QFOption, url: string, params: any): string;
