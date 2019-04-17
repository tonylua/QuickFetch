import qs from 'qs';
import mergeWith from 'lodash-es/mergeWith';
import omit from 'lodash-es/omit';
import trim from 'lodash-es/trim';
import MiddlewareHolder from './MiddlewareHolder';
import CustomError from './CustomError';
import OptRequest from './OptRequest';
import {
	_getLastestHeaders,
	_formatHeaders,
	_parseBody,
	_getURL
} from './utils';

/**
 * QuickFetch
 * @extends MiddlewareHolder
 */
class QuickFetch extends MiddlewareHolder {
	
	/**
	* QuickFetch constructor
	* @description a fetch-based HTTP request tool
	* @class
	* @param {Object|null} [option] - an optional object for Request API
	* @param {string} [option.baseURL] - an optional url prefix
	* @param {string} [option.timeout     = 30000] - an optional timeout
	* @param {Boolean} [option.catchError = true] - optional, 
	*  if true then just parse error in middleware, otherwise throw it to endpoint
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
    return this._parseMiddlewares(reqMids, req, option);
  }

  /**
   * @private
   * @param {Response} res
   * @param {object} [option]
   */
  _parseResponseMiddlewares(res, option) {
    const resMids = this._getMiddlewares(QuickFetch.RESPONSE, option);
    return this._parseMiddlewares(resMids, res, option);
  }

  /**
   * @private
   * @param {Error} err
   * @param {object} [option]
   */
  _parseErrorMiddlewares(err, option) {
    const errMids = this._getMiddlewares(QuickFetch.ERROR, option);
    return this._parseMiddlewares(errMids, err, option);
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
          timeout: 30000,
          baseURL: '',
          catchError: true
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
      }, {})

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
            const timeoutPromise = new Promise((resolve, reject) => {
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
						console.log(error.request.url, 111)
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
   * @param {Object|null} [option] - an optional object for Request API
   * @param {string} [option.baseURL] - an optional url prefix
   * @param {string} [option.timeout=30000] - an optional timeout
   * @param {Boolean} [option.catchError=true] - optional, 
   *  if true then just parse error in middleware, otherwise throw it to endpoint
   * @returns {Promise} a Promise that resolves to a Response object
   */
  get(...args) {
    return this._doRequest('get').apply(this, args);
  }

  /**
   * make a POST fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {Object|null} [option] - an optional object for Request API
   * @param {string} [option.baseURL] - an optional url prefix
   * @param {string} [option.timeout=30000] - an optional timeout
   * @param {Boolean} [option.catchError=true] - optional, 
   *  if true then just parse error in middleware, otherwise throw it to endpoint
   * @returns {Promise} a Promise that resolves to a Response object
   */
  post(...args) {
    return this._doRequest('post').apply(this, args);
  }

  /**
   * make a DELETE fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {Object|null} [option] - an optional object for Request API
   * @param {string} [option.baseURL] - an optional url prefix
   * @param {string} [option.timeout=30000] - an optional timeout
   * @param {Boolean} [option.catchError=true] - optional, 
   *  if true then just parse error in middleware, otherwise throw it to endpoint
   * @returns {Promise} a Promise that resolves to a Response object
   */
  delete(...args) {
    return this._doRequest('delete').apply(this, args);
  }

  /**
   * make a PUT fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {Object|null} [option] - an optional object for Request API
   * @param {string} [option.baseURL] - an optional url prefix
   * @param {string} [option.timeout=30000] - an optional timeout
   * @param {Boolean} [option.catchError=true] - optional, 
   *  if true then just parse error in middleware, otherwise throw it to endpoint
   * @returns {Promise} a Promise that resolves to a Response object
   */
  put(...args) {
    return this._doRequest('put').apply(this, args);
  }

  /**
   * make a PATCH fetch
   * @param {string} url
   * @param {Object|null} [params] - an optional params object
   * @param {Object|null} [option] - an optional object for Request API
   * @param {string} [option.baseURL] - an optional url prefix
   * @param {string} [option.timeout=30000] - an optional timeout
   * @param {Boolean} [option.catchError=true] - optional, 
   *  if true then just parse error in middleware, otherwise throw it to endpoint
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

export default QuickFetch;
