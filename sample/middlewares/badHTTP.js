import QuickFetch from 'quickfetch';
import CustomError from '../CustomError';

const ERROR_HTTP = 'ERROR_HTTP';

const isBadRequest = status => status >= 300;

/**
 * 映射 HTTP 错误时的提示语句
 * @returns {Object}
 */
const badStatusMap = (url) => ({ // eslint-disable-line
  401: '请求未授权!',
  403: '拒绝访问',
  404: '请求资源未找到!',
  415: '请求参数类型错误!',
  500: '服务器内部错误'
});

export default function useBadHTTPMiddleware(r) {
  // bad HTTP request
  const badHTTPMiddleware = r.use(QuickFetch.RESPONSE, async (res, next) => {
    const { status } = res;
    if (isBadRequest(status)) {
      console.log('%c[fetchWrapper] bad HTTP request: status is %s', 'color: red', status);

      const err = new CustomError(ERROR_HTTP, {
        response: res
      });
      next(Promise.reject(err));
      return;
    }
    next(res);
  });
  r.use(QuickFetch.ERROR, (err, next) => {
    if (err.message === ERROR_HTTP) {
      const { status, statusText, url } = err.data.response;
      const message = badStatusMap(url)[status] || statusText;
      alert(message);
    }
    next(err);
  });

  return badHTTPMiddleware;
}
