import QuickFetch from 'quickfetch';
import store from '@/store';
import CustomError from '../CustomError';

const ERROR_BUSINESS = 'ERROR_BUSINESS';

/**
 * 判断业务逻辑码
 * @param {number} code 
 */
const isValidCode = (code) => {
  const c = parseInt(code, 10);
  return (!Number.isNaN(c)) && (c === 0);
};

export default function useWrongBusiMiddleware(r) {
  // wrong business logic
  const wrongBusiMiddleware = r.use(QuickFetch.RESPONSE, async (res, next) => {
    if (res instanceof Response) {
      const { headers, url } = res;
      const json = await res.clone().json(); // clone() is important!
      const { code } = json;
      if (!isValidCode(code)) {
        console.log('%c[fetchWrapper] wrong business logic: code is %s', 'color: red', code);
        const err = new CustomError(ERROR_BUSINESS, {
          response: res
        });
        next(Promise.reject(err));
        return;
      }
      next(res);
      return;
    }
    next(res);
  });
  r.use(QuickFetch.ERROR, async (err, next) => {
    if (err.message === ERROR_BUSINESS) {
      const { response } = err.data;
      const { url, headers } = response;
      const json = await response.json();
			
			alert(json.message);
    }
    next(err);
  });

  return wrongBusiMiddleware;
}
