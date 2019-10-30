import qs from 'qs';
import mergeWith from 'lodash-es/mergeWith';
import omit from 'lodash-es/omit';
import trim from 'lodash-es/trim';
import isEmpty from 'lodash-es/isEmpty';
import MiddlewareHolder from './MiddlewareHolder';
import CustomError from './CustomError';
import OptRequest from './OptRequest';
import {
	_getLastestHeaders,
	_formatHeaders,
	_parseBody,
	_getURL,
  _getDefaultFetchId
} from './utils';

const _abortControllers = {};
const supportsAbort = typeof AbortController === 'function';

/**
 * an optional object for Request API
 * @typedef {Object|Null} option
 * @property {string} [method] standard fetch init option
 * @property {string} [credentials = include] standard fetch init option
 * @property {string} [mode = cors] standard fetch init option
 * @property {string} [cache = reload] standard fetch init option
 * @property {Object} [headers] standard fetch init option
 * @property {string} [baseURL] - optional, an url prefix
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
class QuickFetch extends MiddlewareHolder {
  
  /**
   * cancel a fetch action
   * @static
   * @param {string|number|symbol} id - fetchId
   */
  static abort(id) {
    if (!supportsAbort) return;
    const ac = _abortControllers[id];
    if (!ac) return;
    if (ac instanceof AbortController) {
      // console.log(id, 'abort');
      ac.abort();
    } 
    delete _abortControllers[id];
  }
	
	/**
	* QuickFetch constructor
	* @description a fetch-based HTTP request tool
	* @class
  * @param {option} [option]
	*/
	constructor(option) {
		super(option);
		this._globalOption = option;
		this._originFetch = fetch;
	}
	
  /**
   * @private
   * @param {Request} req
   * @param {object} [option]
   */
  _parseRequestMiddlewares(req, option) {
    const reqMids = this._getMiddlewares(QuickFetch.REQUEST, option);
    return this._parseMiddlewares(reqMids, req);
  }

  /**
   * @private
   * @param {Response} res
   * @param {object} [option]
   */
  _parseResponseMiddlewares(res, option) {
    const resMids = this._getMiddlewares(QuickFetch.RESPONSE, option);
    const parseParams = {
      method: option.method.toUpperCase()
    };
    if (!isEmpty(option.headers)) {
      try {
        parseParams.requestHeaders = new Headers(option.headers);
      } catch(ex) {}
    }
    return this._parseMiddlewares(resMids, res, parseParams);
  }

  /**
   * @private
   * @param {Error} err
   * @param {object} [option]
   */
  _parseErrorMiddlewares(err, option) {
    const errMids = this._getMiddlewares(QuickFetch.ERROR, option);
    return this._parseMiddlewares(errMids, err);
  }

  /**
   * @private
   * @param {string} method - a HTTP verb
   * @param {function} a function to execute the real HTTP verb
   */
  _doRequest(method = 'get') {
    method = method.toUpperCase();

    // the origin fetch method
    let _fetch = this._originFetch;
    let _this = this;

    return function(url, params = {}, option = {}) {
      
      // merge option
      option = [
        {
          method,
          credentials: 'include',
          mode: 'cors',
          cache: 'reload',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          ignoreBodyMethods: ['get', 'head'],
          forceJSON: false,
          timeout: 30000,
          baseURL: '',
          catchError: true,
          fetchId: _getDefaultFetchId()
        },
        this._globalOption,
        option
      ].reduce((rst, opt) => {
        rst = mergeWith(rst, opt, (objValue, srcValue, key, object, source, stack) => {
          if (Array.isArray(objValue) && Array.isArray(srcValue)) {
            return srcValue; // 合并数组时直接替换
          }
          return void(0); // 默认合并
        });
        return rst;
      }, {});
      
      if (supportsAbort) {
        const _ac = new AbortController();
        if (!option.signal) option.signal = _ac.signal;
        _abortControllers[option.fetchId] = _ac;
        option.signal.addEventListener('abort', () => {
          // console.log(option.fetchId, 'aborttttttt');
          const evt = new CustomEvent(QuickFetch.EVENT_FETCH_ABORT, {
            detail: {
              fetchId: option.fetchId,
              signal: option.signal
            }
          });
          // console.log(evt, 111, typeof _this.dispatchEvent, evt.detail);
          _this.dispatchEvent(evt);
        });
      }

      _formatHeaders(option);
      _parseBody(option, method, params);
      let rUrl = _getURL(option, url, params);
      const req = new OptRequest(trim(rUrl), option);

      // timeout support
      if ('timeout' in option && !Number.isNaN(parseInt(option.timeout, 10))) {
        _fetch = ((fetch) => {
          return (request) => {
            const fetchPromise = fetch.apply(null, [request]);
            // eslint-disable-next-line no-unused-vars
            const timeoutPromise = new Promise((_, reject) => {
              const err = new CustomError(QuickFetch.EXCEPTION_TIMEOUT, request)
              setTimeout(
                () => { reject(err); },
                option.timeout
              );
            });
            return Promise.race([fetchPromise, timeoutPromise]);
          };
        })(this._originFetch);
      }
      
      return this._parseRequestMiddlewares(req, option).then(
        request => {
          let optClone = request.init;
          optClone.headers = _getLastestHeaders(request);
          
          _formatHeaders(optClone);
          _parseBody(optClone, method, params);
          let rUrl = _getURL(optClone, url, params);
          const reqClone = new OptRequest(rUrl, optClone);

          return _fetch(reqClone).then(
            res => this._parseResponseMiddlewares(res, option)
          ).catch((error) => {
            error.request = req.clone();
            return this._parseErrorMiddlewares(error, option);
          })
        }
      ).then((obj) => {
        if (obj && obj instanceof Error && option.catchError) {
          throw obj;
        }
        return obj;
      }).catch((err) => {
        if (err && option.catchError) {
          throw err;
        }
      });
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
  get(...args) {
    return this._doRequest('get').apply(this, args);
  }

  /**
   * make a POST fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {option} [option]
   * @returns {Promise} a Promise that resolves to a Response object
   */
  post(...args) {
    return this._doRequest('post').apply(this, args);
  }

  /**
   * make a DELETE fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {option} [option]
   * @returns {Promise} a Promise that resolves to a Response object
   */
  delete(...args) {
    return this._doRequest('delete').apply(this, args);
  }

  /**
   * make a PUT fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {option} [option]
   * @returns {Promise} a Promise that resolves to a Response object
   */
  put(...args) {
    return this._doRequest('put').apply(this, args);
  }

  /**
   * make a PATCH fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {option} [option]
   * @returns {Promise} a Promise that resolves to a Response object
   */
  patch(...args) {
    return this._doRequest('patch').apply(this, args);
  }

  /**
   * make batch requests
   * @param {Promise[]} requestPromiseArr
   * @returns {Response[]}
   */
  sequence(requestPromiseArr) {
    const responseArr = [];
    return requestPromiseArr.reduce(
      (promise, req) => promise.then(
        () => req.then(
            res => responseArr.push(res)
          ).catch(
            ex => Promise.reject(ex)
          )
      ), Promise.resolve()
    ).then(
      () => responseArr
    );
  }
	
}

/**
 * @memberof QuickFetch
 * @static
 */
QuickFetch.REQUEST = 'REQUESTER_TYPE_REQUEST';
/**
 * @memberof QuickFetch
 * @static
 */
QuickFetch.RESPONSE = 'REQUESTER_TYPE_RESPONSE';
/**
 * @memberof QuickFetch
 * @static
 */
QuickFetch.ERROR = 'REQUESTER_TYPE_ERROR';
/**
 * @memberof QuickFetch
 * @static
 */
QuickFetch.EXCEPTION_TIMEOUT = 'REQUESTER_ERROR_TIMEOUT';
/**
 * @memberof QuickFetch
 * @static
 */
QuickFetch.EVENT_FETCH_ABORT = 'FetchAbort';

export default QuickFetch;
