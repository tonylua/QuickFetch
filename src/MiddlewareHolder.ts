import findIndex from "lodash-es/findIndex";
import { _cloneObject, _isValidFetchId } from "./utils";
import {
  QFMidWrapper,
  QFMidFn,
  QFMidTypes,
  QFOption,
  QFCloneable,
  QFFetchID,
  QFUseReturnType,
} from "./quickfetch";

/**
 * MiddlewareHolder
 * @extends EventTarget
 */
class MiddlewareHolder extends EventTarget {
  private _midIdFlag: number;
  private _mids: Array<QFMidWrapper>;

  constructor() {
    super();
    this._midIdFlag = 0;
    this._mids = [];
  }

  /**
   * @protected
   * @param {String} type - QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR
   * @param {Object} [option]
   */
  protected _getMiddlewares(
    type: QFMidTypes,
    option: QFOption
  ): Array<QFMidFn> {
    const mObjArr = this._mids.filter((m) => m.type === type);
    if (!mObjArr.length) return [];
    let mids = mObjArr;
    const fetchId = option?.fetchId;
    if (_isValidFetchId(fetchId)) {
      mids = mids.filter((mw) => !mw.fetchId || mw.fetchId === fetchId);
      mids = mids.filter((mw) => !mw.disabledUses[fetchId!]);
      if (!mids.length) return [];
    } else {
      mids = mObjArr.filter((mw) => !mw.fetchId);
      mids = mids.filter((mw) => !mw.allDisabled);
    }
    return mids.map((mw) => mw.middleware);
  }

  /**
   * @protected
   * @param {Array} mids
   * @param {Request|Response|JSON|Blob} target
   * @param {Object} [params = null]
   */
  protected _parseMiddlewares(
    mids: Array<QFMidFn>,
    target: QFCloneable,
    params: any = null
  ) {
    if (!mids) {
      return Promise.resolve(_cloneObject(target));
    }
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve) => {
      const next = (obj: QFCloneable) => {
        const rtn = _cloneObject(obj);
        if (params) {
          Object.keys(params).forEach((k) => ((rtn as any)[k] = params[k]));
        }
        if (!mids.length) {
          return resolve(rtn);
        }
        const mw = mids.shift();
        mw?.(rtn, next);
      };
      next(_cloneObject(target));
    });
  }

  /**
   * regist a middleware
   * @param {string} type - QuickFetch.REQUEST | QuickFetch.RESPONSE | QuickFetch.ERROR
   * @param {function} middleware - a function looks like ```(req|res|err, next) => {}```
   * @param {string|number} [fetchId] - a optional id for special requests
   * @returns {object} actions - { unuse, pause, resume }
   */
  use(
    type: QFMidTypes,
    middleware: QFMidFn,
    fetchId: QFFetchID
  ): QFUseReturnType {
    if (!type || typeof type !== "string") return;
    if (!middleware || typeof middleware !== "function") return;

    const id = this._midIdFlag++;

    const mObj: QFMidWrapper = {
      id,
      type,
      middleware,
      disabledUses: {},
    };

    if (_isValidFetchId(fetchId)) {
      mObj.fetchId = fetchId;
    }

    this._mids.push(mObj);

    console.log(
      "regist middleware %s %s, new array length is %s",
      id,
      _isValidFetchId(fetchId) ? `(${fetchId.toString()})` : "",
      this._mids.length
    );

    return {
      unuse: () => this._unuse(id),
      pause: (muId) => this._pause(id, muId),
      resume: (muId) => this._resume(id, muId),
    };
  }

  /**
   * @protected
   * unregist a middleware
   * @param {number} id
   */
  protected _unuse(id: number): void {
    if (typeof id === "undefined") return;
    const idx = findIndex(this._mids, { id });
    if (idx < 0) return;
    this._mids.splice(idx, 1);

    console.log(
      `unregist middleware ${id}, new array length is ${this._mids.length}`
    );
  }

  /**
   * @protected
   * pause a middleware
   * @param {number} id
   * @param {string|number} [fetchId] - a optional id for special requests
   */
  protected _pause(id: number, fetchId: QFFetchID): void {
    if (typeof id === "undefined") return;
    const idx = findIndex(this._mids, { id });
    if (idx < 0) return;

    const mw = this._mids[idx];
    const dObj = mw.disabledUses;

    if (_isValidFetchId(fetchId) && !dObj[fetchId]) {
      dObj[fetchId] = true;
    } else {
      mw.allDisabled = true;
    }

    console.log(
      `pause(disable) middleware ${id} ${
        _isValidFetchId(fetchId) ? "for " + fetchId.toString() : ""
      }`,
      dObj
    );
  }

  /**
   * @protected
   * resume a paused middleware
   * @param {number} id
   * @param {string|number} [fetchId] - a optional id for special requests
   */
  protected _resume(id: number, fetchId: QFFetchID): void {
    if (typeof id === "undefined") return;
    const idx = findIndex(this._mids, { id });
    if (idx < 0) return;

    const mw = this._mids[idx];
    const dObj = mw.disabledUses;

    if (_isValidFetchId(fetchId) && dObj[fetchId]) {
      delete dObj[fetchId];
    } else {
      mw.allDisabled = false;
    }

    console.log(
      `resume(enable) middleware ${id} ${
        _isValidFetchId(fetchId) ? "for " + fetchId.toString() : ""
      }`,
      dObj
    );
  }
}

export default MiddlewareHolder;
