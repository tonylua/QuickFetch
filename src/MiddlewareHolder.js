import findIndex from 'lodash-es/findIndex';
import {
	_cloneObject,
	_isValidUseId
} from './utils';

class MiddlewareHolder {
	
	constructor() {
		this._midIdFlag = 0;
		this._mids = [];
	}

  /**
   * @private
   * @param {String} type - QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR
   * @param {Object} [option]
   */
  _getMiddlewares(type, option) {
    const mObjArr = this._mids.filter(m => m.type === type);
    if (!mObjArr.length) return null;
    let mids = mObjArr;
    const { fetchId } = option;
    if (_isValidUseId(fetchId)) {
      mids = mids.filter(mw => (!mw.fetchId || mw.fetchId === fetchId));
      mids = mids.filter(mw => !mw.disabledUses[fetchId]);
      if (!mids.length) return null;
    } else {
      mids = mObjArr.filter(mw => !mw.fetchId);
      mids = mids.filter(mw => !mw.allDisabled);
    }
    mids = mids.map(mw => mw.middleware);
    return mids;
  }

  /**
   * @private
   * @param {Array} mids 
   * @param {Request|Response|JSON|Blob} target
   * @param {Object} [params = null]
   */
  _parseMiddlewares(mids, target, params = null) {
    if (!mids) {
      return Promise.resolve(_cloneObject(target));
    }
    // eslint-disable-next-line no-unused-vars
    return new Promise(((resolve, reject) => {
      const next = (obj) => {
        const rtn = _cloneObject(obj);
        if (params) {
          Object.keys(params).forEach(k => rtn[k] = params[k]);
        }
        if (!mids.length) {
          return resolve(rtn);
        }
        const mw = mids.shift();
        mw(rtn, next);
      };
      next(_cloneObject(target));
    }));
  }

  /**
   * regist a middleware
   * @param {string} type - QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR
   * @param {function} middleware - a function looks like '(req|res|err, next) => {}'
   * @param {string|number} [fetchId] - a optional id for special requests
   * @returns {object} actions - { unuse, pause, resume }
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
  }

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
  }

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
  }

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
  }
}

export default MiddlewareHolder;