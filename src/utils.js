import qs from 'qs';

export function _getLastestHeaders(request) {
  const newHeaders = {};
  for (const key of request.headers.keys()) {
    newHeaders[key] = request.headers.get(key);
  }
  return newHeaders;
}

export function _cloneObject(target) {
  return target && typeof target.clone === 'function'
    ? target.clone()
    : target;
}

export function _isValidUseId(fetchId) {
  return typeof fetchId !== 'undefined' 
    && ((typeof fetchId === 'string' && fetchId.length)
      || typeof fetchId === 'number');
}

export function _formatHeaders(option) {
  if (option.headers) {
    Object.keys(option.headers).forEach((key) => {
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

export function _parseBody(option, method, params) {
  delete option.body;

  const needBody = !~option.ignoreBodyMethods.indexOf(method.toLowerCase());
  const sendJSON = option.forceJSON
    || (option.headers 
        && /^application\/(merge\-patch\+)?json;?/.test(option.headers['content-type']));
  if (needBody) {
    option.body = sendJSON 
      ? JSON.stringify(params) 
      : qs.stringify(params);
  }
}

export function _getURL(option, url, params) {
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
