import { mergeWith } from 'lodash';
import saveAs from 'file-saver';
import QuickFetch from '../src/QuickFetch';

const isBadRequest = status => status >= 300;

const isValidCode = (code) => {
  const c = parseInt(code, 10);
  return (!Number.isNaN(c)) && (c === 0);
};

const wrapper = function(option) {
  const r = new QuickFetch(option);

  // timeout
  r.use(QuickFetch.ERROR, (err, next) => {
    if (QuickFetch.EXCEPTION_TIMEOUT === err.message) {
      console.log('%c[FetchWrapper] catch a error: ', 'color: red', err.message, err.request);
    }
    next(err);
  });
  
  // bad HTTP request
  r.use(QuickFetch.RESPONSE, (res, next) => {
    const { status } = res;
    if (isBadRequest(status)) {
      console.log('%c[FetchWrapper] bad HTTP request: status is %s', 'color: red', status);
      next(new Error(status));
      return;
    }
    next(res);
  });

  // wrong business logic
  const wrongBusiMiddleware = r.use(QuickFetch.RESPONSE, (res, next) => {
    if (res instanceof Response) {
      // clone() is important!
      return res.clone().json().then((json) => {
        const { code } = json;
        if (!isValidCode(code)) {
          console.log('%c[FetchWrapper] wrong business logic: code is %s', 'color: red', code);
          next(new Error(code));
          return;
        }
        next(res);
      });
    }
    next(res);
  });

  // extend a download method
  r.download = function(method, url, params, roption) {
    const dlFetchId = 'my_download';

    wrongBusiMiddleware.pause(dlFetchId);

    const downHeadersMiddleware = r.use(QuickFetch.REQUEST, (req, next) => {
      req.headers.set('Content-Type', 'application/x-www-form-urlencoded');
      next(req);
    }, dlFetchId);
    
    console.log('download starting...');

    return QuickFetch.prototype[method.toLowerCase()]
      .call(r, url, params, mergeWith(roption, {
        fetchId: dlFetchId,
        catchError: false
      }))
      .then(
        (res) => {
          const disposition = res.headers.get('content-disposition');
          if (disposition && disposition.match(/attachment/)) {
            let filename = disposition.replace(/attachment;.*filename=/, '').replace(/"/g, '');
            filename = filename && filename !== '' 
              ? filename 
              : 'download';
            res.blob().then(blob => saveAs(blob, filename));
          }
          return res.json();
        }
      )
      .finally(
        () => {
          downHeadersMiddleware.unuse();
          wrongBusiMiddleware.resume(dlFetchId);
          console.log('finish download');
        }
      );
  };

  return r;
};

export default wrapper;
