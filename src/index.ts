import clone from "lodash-es/clone";
import mergeWith from "lodash-es/mergeWith";
import uniq from "lodash-es/uniq";
import trim from "lodash-es/trim";
import isEmpty from "lodash-es/isEmpty";
import MiddlewareHolder from "./MiddlewareHolder";
import CustomError from "./CustomError";
import OptRequest from "./OptRequest";
import {
  _getLatestHeaders,
  _formatHeaders,
  _parseBody,
  _getURL,
  _getDefaultFetchId,
} from "./utils";
import { QFFetchID, QFOption, QFDoReqFn } from "./quickfetch";

// @ts-ignore
const _abortControllers: { [key: QFFetchID]: AbortController } = {};
const supportsAbort = typeof AbortController === "function";

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
  static readonly REQUEST: string = "REQUESTER_TYPE_REQUEST";
  /**
   * @memberof QuickFetch
   * @static
   */
  static readonly RESPONSE: string = "REQUESTER_TYPE_RESPONSE";
  /**
   * @memberof QuickFetch
   * @static
   */
  static readonly ERROR: string = "REQUESTER_TYPE_ERROR";
  /**
   * @memberof QuickFetch
   * @static
   */
  static readonly EXCEPTION_TIMEOUT: string = "REQUESTER_ERROR_TIMEOUT";
  /**
   * @memberof QuickFetch
   * @static
   */
  static readonly EVENT_FETCH_ABORT: string = "FetchAbort";
  /**
   * cancel a fetch action
   * @static
   * @param {string|number|symbol} id - fetchId
   */
  static abort(id: QFFetchID) {
    if (!supportsAbort) return;
    // @ts-ignore
    const ac: AbortController = _abortControllers[id];
    if (!ac) return;
    if (ac instanceof AbortController) {
      // console.log(id, 'abort');
      ac.abort();
    }
    // @ts-ignore
    delete _abortControllers[id];
  }

  private _globalOption: QFOption;
  private _originFetch: (...args: any[]) => any;

  /**
   * QuickFetch constructor
   * @description a fetch-based HTTP request tool
   * @class
   * @param {option} [option]
   */
  constructor(option: QFOption) {
    super();
    this._globalOption = option;
    this._originFetch = fetch;
  }

  /**
   * @private
   * @param {OptRequest} req
   * @param {object} [option]
   */
  private _parseRequestMiddlewares(req: OptRequest, option: QFOption) {
    const reqMids = this._getMiddlewares(QuickFetch.REQUEST, option);
    return this._parseMiddlewares(reqMids, req);
  }

  /**
   * @private
   * @param {Response} res
   * @param {object} [option]
   */
  private _parseResponseMiddlewares(res: OptRequest, option: QFOption) {
    const resMids = this._getMiddlewares(QuickFetch.RESPONSE, option);
    const parseParams = {
      method: option!.method.toUpperCase(),
    };
    if (!isEmpty(option!.headers)) {
      try {
        // @ts-ignore
        parseParams.requestHeaders = new Headers(option.headers);
      } catch (ex) {}
    }
    return this._parseMiddlewares(resMids, res, parseParams);
  }

  /**
   * @private
   * @param {Error} err
   * @param {object} [option]
   */
  private _parseErrorMiddlewares(err: Error, option: QFOption) {
    const errMids = this._getMiddlewares(QuickFetch.ERROR, option);
    return this._parseMiddlewares(errMids, err);
  }

  /**
   * @private
   * @param {string} method - a HTTP verb
   * @param {function} a function to execute the real HTTP verb
   */
  private _doRequest(method: string = "get"): QFDoReqFn {
    method = method.toUpperCase();

    // the origin fetch method
    let _fetch = this._originFetch;
    let _this = this;

    return function (url, params = {}, originOption = {}) {
      // merge option
      const option: QFOption = [
        {
          method,
          credentials: "include",
          mode: "cors",
          cache: "reload",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          ignoreBodyMethods: ["get", "head"],
          forceJSON: false,
          timeout: 30000,
          baseURL: "",
          catchError: true,
          fetchId: _getDefaultFetchId(),
        },
        this._globalOption,
        originOption,
      ].reduce((rst, opt) => {
        rst = mergeWith(
          rst,
          opt,
          // @ts-ignore
          (objValue, srcValue, key, object, source, stack) => {
            if (key === "ignoreBodyMethods") {
              return uniq(
                (Array.isArray(srcValue) ? srcValue : []).concat([
                  "get",
                  "head",
                ]) // ensure GET/HEAD
              );
            }
            if (Array.isArray(objValue) && Array.isArray(srcValue)) {
              return srcValue; // 合并数组时直接替换
            }
            return void 0; // 默认合并
          }
        );
        return rst;
      }, {}) as QFOption;

      if (supportsAbort) {
        const _ac = new AbortController();
        if (!option!.signal) option!.signal = _ac.signal;
        // @ts-ignore
        _abortControllers[option!.fetchId] = _ac;
        option!.signal.addEventListener("abort", () => {
          const evt = new CustomEvent(QuickFetch.EVENT_FETCH_ABORT, {
            detail: {
              fetchId: option!.fetchId,
              signal: option!.signal,
            },
          });
          _this.dispatchEvent(evt);
        });
      }

      _formatHeaders(option);
      _parseBody(option, method, params);
      let rUrl = _getURL(option, url, params);
      const req = new OptRequest(trim(rUrl), option);

      // timeout support
      if (option && "timeout" in option) {
        if (typeof option.timeout === "string") {
          option.timeout = parseInt(option.timeout, 10);
        }
        if (!!option.timeout) {
          _fetch = ((fetch) => {
            return (...toargs: any[]) => {
              const fetchPromise = fetch.apply(null, toargs);
              // eslint-disable-next-line no-unused-vars
              const timeoutPromise = new Promise((_, reject) => {
                const err = new CustomError(
                  QuickFetch.EXCEPTION_TIMEOUT,
                  toargs[0]
                );
                setTimeout(() => {
                  reject(err);
                }, option.timeout);
              });
              return Promise.race([fetchPromise, timeoutPromise]);
            };
          })(this._originFetch);
        }
      }

      return (
        this._parseRequestMiddlewares(req, option)
          // @ts-ignore
          .then((request: OptRequest) => {
            let optClone = clone(request.init) as QFOption;
            optClone!.headers = _getLatestHeaders(request);

            _formatHeaders(optClone);
            _parseBody(optClone, method, params);
            let rUrl = _getURL(optClone, url, params);
            const reqClone = new OptRequest(rUrl, optClone);

            return _fetch(reqClone)
              .then((res: OptRequest) =>
                this._parseResponseMiddlewares(res, option)
              )
              .catch((error: Error) => {
                (error as any).request = req.clone();
                return this._parseErrorMiddlewares(error, option);
              });
          })
          .then((obj) => {
            if (obj && obj instanceof Error && option!.catchError) {
              throw obj;
            }
            return obj;
          })
          .catch((err) => {
            if (err && option!.catchError) {
              throw err;
            }
          })
      );
    };
  }

  /**
   * make a GET fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {option} [option]
   * @see {@link QuickFetch#constuctor}
   * @returns {Promise} a Promise that resolves to a Response object
   */
  get(...args: keyof QFDoReqFn) {
    return this._doRequest("get").apply(this, args);
  }

  /**
   * make a POST fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {option} [option]
   * @returns {Promise} a Promise that resolves to a Response object
   */
  post(...args: keyof QFDoReqFn) {
    return this._doRequest("post").apply(this, args);
  }

  /**
   * make a DELETE fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {option} [option]
   * @returns {Promise} a Promise that resolves to a Response object
   */
  delete(...args: keyof QFDoReqFn) {
    return this._doRequest("delete").apply(this, args);
  }

  /**
   * make a PUT fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {option} [option]
   * @returns {Promise} a Promise that resolves to a Response object
   */
  put(...args: keyof QFDoReqFn) {
    return this._doRequest("put").apply(this, args);
  }

  /**
   * make a PATCH fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {option} [option]
   * @returns {Promise} a Promise that resolves to a Response object
   */
  patch(...args: keyof QFDoReqFn) {
    return this._doRequest("patch").apply(this, args);
  }

  /**
   * make batch requests
   * @param {Promise[]} requestPromiseArr
   * @returns {Response[]}
   */
  sequence(requestPromiseArr: Array<Promise<any>>) {
    const responseArr: Array<Promise<any>> = [];
    return requestPromiseArr
      .reduce(
        (promise, req) =>
          promise.then(() =>
            req
              .then((res) => responseArr.push(res))
              .catch((ex) => Promise.reject(ex))
          ),
        Promise.resolve()
      )
      .then(() => responseArr);
  }

  /**
   * send a beacon
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @returns {boolean|Promise} send result
   */
  ping(url: string, params: any): boolean | Promise<any> {
    if ("sendBeacon" in navigator) {
      return navigator.sendBeacon(url, params || new FormData());
    }
    return (this.post as Function)(url, params, {
      keepalive: true,
    });
  }
}
