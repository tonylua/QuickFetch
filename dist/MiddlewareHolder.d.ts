import { QFMidFn, QFMidTypes, QFOption, QFCloneable, QFFetchID, QFUseReturnType } from "./quickfetch";
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
