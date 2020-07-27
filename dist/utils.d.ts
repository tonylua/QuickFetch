import OptRequest from "./OptRequest";
import { QFHeaders, QFOption, QFCloneable } from "./quickfetch";
export declare function _getLatestHeaders(request: OptRequest): QFHeaders;
export declare function _cloneObject(target: QFCloneable): QFCloneable;
export declare function _getDefaultFetchId(): symbol;
export declare function _isValidFetchId(fetchId?: string | number | symbol): number | boolean;
export declare function _formatHeaders(option: QFOption): void;
export declare function _parseBody(option: QFOption, method: string, params: any): void;
export declare function _getURL(option: QFOption, url: string, params: any): string;
