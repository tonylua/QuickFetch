import qs from 'qs';
import mergeWith from 'lodash-es/mergeWith';
import omit from 'lodash-es/omit';
import keys from 'lodash-es/keys';
import map from 'lodash-es/map';
import filter from 'lodash-es/filter';
import trim from 'lodash-es/trim';
import findIndex from 'lodash-es/findIndex';
import CustomError from './CustomError';
// 这种写法无法正确 tree shaking 并会造成引用错误
// import {
//   mergeWith, omit, keys, map, filter, findIndex
// } from 'lodash-es';

class OptRequest extends Request {
  constructor(input, init) {
    super(input, init);
    this.init = init;
  }
  clone() {
    this.init.headers = _getLastestHeaders(this);
    return new OptRequest(this, this.init);
  }
}

function _getLastestHeaders(request) {
  const newHeaders = {};
  for (const key of request.headers.keys()) {
    newHeaders[key] = request.headers.get(key);
  }
  return newHeaders;
}

function _cloneObject(target) {
  return target && typeof target.clone === 'function'
    ? target.clone()
    : target;
}

function _isValidUseId(fetchId) {
  return typeof fetchId !== 'undefined' 
    && ((typeof fetchId === 'string' && fetchId.length)
      || typeof fetchId === 'number');
}

function _formatHeaders(option) {
  if (option.headers) {
    keys(option.headers).forEach((key) => {
      let hVal = option.headers[key];
      // case-sensitive
			delete option.headers[key];
			key = key.toLowerCase();
			option.headers[key] = hVal;
			// clear
      if (typeof hVal === 'undefined'
        || hVal === null
        || hVal === '') {
        delete option.headers[key];
      }
    });
  }
}

function _parseBody(option, method, params) {
  delete option.body;
  const needBody = !/^(get|head)$/i.test(method);
  const sendJSON = option.headers && option.headers['content-type'] === 'application/json';
  if (needBody) {
    option.body = sendJSON 
      ? JSON.stringify(params) 
      : qs.stringify(params);
  }
}

function _getURL(option, url, params) {
  let rUrl = url;
  if (!option.body) {
    const strParam = qs.stringify(params);
    if (strParam.length) {
      const divSign = ~rUrl.indexOf('?') ? '&' : '?';
      rUrl += divSign + strParam;
    }
  }
  // url prefix
  if (option.baseURL) {
    rUrl = `${option.baseURL}/${rUrl}`.replace(/\/+/g, '/');
  }
  return rUrl;
}

/**
 * QuickFetch
 * @description a fetch-based HTTP request tool
 * @class
 * @param {Object|null} [option] - an optional object for Request API
 * @param {string} [option.baseURL] - an optional url prefix
 * @param {string} [option.timeout=30000] - an optional timeout
 * @param {Boolean} [option.catchError=true] - optional, 
 *  if true then just parse error in middleware, otherwise throw it to endpoint
 */
function QuickFetch(option) {
  Object.defineProperties(this, {
    _midIdFlag: {
      value: 0,
      enumerable: false,
      configurable: true,
      writable: true
    },
    _mids: {
      value: [],
      enumerable: false,
      configurable: true,
    },
    _globalOption: {
      value: option,
      enumerable: false,
      configurable: true,
    },
    _originFetch: {
      value: fetch,
      enumerable: false,
      configurable: false,
      writable: false
    }
  });
}

QuickFetch.REQUEST = 'REQUESTER_TYPE_REQUEST';
QuickFetch.RESPONSE = 'REQUESTER_TYPE_RESPONSE';
QuickFetch.ERROR = 'REQUESTER_TYPE_ERROR';
QuickFetch.EXCEPTION_TIMEOUT = 'REQUESTER_ERROR_TIMEOUT';

QuickFetch.prototype = {
  constructor: QuickFetch,

  /**
   * @private
   * @param {String} type - QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR
   * @param {object} [option]
   */
  _getMiddlewares(type, option) {
    const mObjArr = filter(this._mids, m => m.type === type);
    if (!mObjArr.length) return null;
    let mids = mObjArr;
    const { fetchId } = option;
    if (_isValidUseId(fetchId)) {
      mids = filter(mids, mw => (!mw.fetchId || mw.fetchId === fetchId));
      mids = filter(mids, mw => !mw.disabledUses[fetchId]);
      if (!mids.length) return null;
    } else {
      mids = filter(mObjArr, mw => !mw.fetchId);
      mids = filter(mids, mw => !mw.allDisabled);
    }
    mids = map(mids, mw => mw.middleware);
    return mids;
  },

  /**
   * @private
   * @param {Array} mids 
   * @param {Request|Response|JSON|Blob} target
   */
  _parseMiddlewares(mids, target) {
    if (!mids) {
      return Promise.resolve(_cloneObject(target));
    }
    // eslint-disable-next-line no-unused-vars
    return new Promise(((resolve, reject) => {
      const next = (obj) => {
        const rtn = _cloneObject(obj);
        if (!mids.length) {
          return resolve(rtn);
        }
        const mw = mids.shift();
        mw(rtn, next);
      };
      next(_cloneObject(target));
    }));
  },

  /**
   * @private
   * @param {Request} req
   * @param {object} [option]
   */
  _parseRequestMiddlewares(req, option) {
    const reqMids = this._getMiddlewares(QuickFetch.REQUEST, option);
    return this._parseMiddlewares(reqMids, req);
  },

  /**
   * @private
   * @param {Response} res
   * @param {object} [option]
   */
  _parseResponseMiddlewares(res, option) {
    const resMids = this._getMiddlewares(QuickFetch.RESPONSE, option);
    return this._parseMiddlewares(resMids, res);
  },

  /**
   * @private
   * @param {Error} err
   * @param {object} [option]
   */
  _parseErrorMiddlewares(err, option) {
    const errMids = this._getMiddlewares(QuickFetch.ERROR, option);
    return this._parseMiddlewares(errMids, err);
  },

  /**
   * regist a middleware
   * @param {string} type - QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR
   * @param {function} middleware - a function looks like '(req|res|err, next) => {}'
   * @param {string|number} [fetchId] - a optional id for special requests
   * @returns {function} unuse
   */
  use(type, middleware, fetchId) {
    if (!type || typeof type !== 'string') return;
    if (!middleware || typeof middleware !== 'function') return;

    const id = this._midIdFlag++;

    const mObj = {
      id,
      type,
      middleware,
      disabledUses: {}
    };

    if (_isValidUseId(fetchId)) {
      mObj.fetchId = fetchId;
    }

    this._mids.push(mObj);

    console.log(
      'regist middleware %s %s, new array length is %s',
      id,
      _isValidUseId(fetchId) ? `(${fetchId})` : '',
      this._mids.length
    );

    return {
      unuse: () => this._unuse(id),
      pause: muId => this._pause(id, muId),
      resume: muId => this._resume(id, muId)
    };
  },

  /**
   * @private
   * unregist a middleware
   * @param {number} id
   */
  _unuse(id) {
    if (typeof id === 'undefined') return;
    const idx = findIndex(this._mids, { id });
    if (idx < 0) return;
    this._mids.splice(idx, 1);

    console.log(`unregist middleware ${id}, new array length is ${this._mids.length}`);
  },

  /**
   * @private
   * pause a middleware
   * @param {number} id
   * @param {string|number} [fetchId] - a optional id for special requests
   */
  _pause(id, fetchId) {
    if (typeof id === 'undefined') return;
    const idx = findIndex(this._mids, { id });
    if (idx < 0) return;

    const mw = this._mids[idx];
    const dObj = mw.disabledUses;

    if (_isValidUseId(fetchId) && !dObj[fetchId]) {
      dObj[fetchId] = true;
    } else {
      mw.allDisabled = true;
    }

    console.log(
      `pause(disable) middleware ${id} ${_isValidUseId(fetchId) ? 'for ' + fetchId : ''}`,
      dObj
    );
  },

  /**
   * @private
   * resume a paused middleware
   * @param {number} id
   * @param {string|number} [fetchId] - a optional id for special requests
   */
  _resume(id, fetchId) {
    if (typeof id === 'undefined') return;
    const idx = findIndex(this._mids, { id });
    if (idx < 0) return;
    
    const mw = this._mids[idx];
    const dObj = mw.disabledUses;

    if (_isValidUseId(fetchId) && dObj[fetchId]) {
      delete dObj[fetchId];
    } else {
      mw.allDisabled = false;
    }

    console.log(
      `resume(enable) middleware ${id} ${_isValidUseId(fetchId) ? 'for ' + fetchId : ''}`,
      dObj
    );
  },

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
      option = mergeWith({
        method,
        credentials: 'include',
        mode: 'cors',
        cache: 'reload',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 30000,
        baseURL: '',
        catchError: true
      }, this._globalOption, option);

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
  },

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
  },

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
  },

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
  },

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
  },

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
  },

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
};

Object.keys(QuickFetch.prototype)
  .filter(key => (key === 'constructor') || /^_/.test(key))
  .forEach((privateKey) => {
    Object.defineProperty(QuickFetch.prototype, privateKey, {
      enumerable: false,
      configurable: false,
    });
  });

export default QuickFetch;
