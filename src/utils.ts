import qs from "qs";
import OptRequest from "./OptRequest";
import { QFHeaders, QFOption, QFCloneable } from "./quickfetch";

export function _getLatestHeaders(request: OptRequest): QFHeaders {
  const newHeaders: QFHeaders = {};
  for (const key of request.headers.keys()) {
    newHeaders[key] = request.headers.get(key);
  }
  return newHeaders;
}

export function _cloneObject(target: QFCloneable) {
  return target && "clone" in target && typeof target.clone === "function"
    ? target.clone()
    : target;
}

let _fid = 0;
export function _getDefaultFetchId() {
  return Symbol.for(`default_fetchId_${_fid++}`);
}

export function _isValidFetchId(fetchId?: string | number | symbol) {
  return (
    typeof fetchId !== "undefined" &&
    (typeof fetchId === "number" ||
      (typeof fetchId === "string" && fetchId.length) ||
      (typeof fetchId === "symbol" &&
        !/^default_fetchId_/.test(Symbol.keyFor(fetchId)!)))
  );
}

export function _formatHeaders(option: QFOption) {
  if (option?.headers) {
    Object.keys(option.headers).forEach((key) => {
      let hVal = option.headers[key];
      // case-sensitive
      delete option.headers[key];
      key = key.toLowerCase();
      option.headers[key] = hVal;
      // clear
      if (typeof hVal === "undefined" || hVal === null || hVal === "") {
        delete option.headers[key];
      }
    });
  }
}

export function _parseBody(
  option: QFOption,
  method: string,
  params: any
): void {
  if (!option) return;

  delete option.body;

  const needBody = !~option.ignoreBodyMethods!.indexOf(method.toLowerCase());
  const sendJSON =
    option.forceJSON ||
    (option.headers &&
      /^application\/(.*?\+)?json;?/.test(option.headers["content-type"]));
  if (needBody) {
    option.body = sendJSON ? JSON.stringify(params) : qs.stringify(params);
  }
}

export function _getURL(option: QFOption, url: string, params: any): string {
  if (!option) return url;
  let rUrl = url;
  if (!option.body) {
    const strParam = qs.stringify(params);
    if (strParam.length) {
      const divSign = ~rUrl.indexOf("?") ? "&" : "?";
      rUrl += divSign + strParam;
    }
  }
  // url prefix
  if (option.baseURL) {
    rUrl = `${option.baseURL}/${rUrl}`.replace(/\/+/g, "/");
  }
  // endpoint
  if (option.endpoint) {
    rUrl = `${option.endpoint}${rUrl}`;
  }
  return rUrl;
}
