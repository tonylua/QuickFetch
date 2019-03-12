import mergeWith from 'lodash-es/mergeWith';
import saveAs from 'file-saver';
import QuickFetch from 'quickfetch';
import useHeadersMiddleware from './middlewares/headers';
import useBodyMiddleware from './middlewares/body';
import useTimeoutMiddleware from './middlewares/timeout';
import useBadHTTPMiddleware from './middlewares/badHTTP';
import useWrongBusiMiddleware from './middlewares/wrongBusiness';

const BASE_URL = '/ajax-prefix/some';
const TIMEOUT = 10000;

const Wrapper = function(option) {
  const r = new QuickFetch(mergeWith({
    timeout: TIMEOUT,
    baseURL: BASE_URL,
    ignoreBodyMethods: ['get', 'head', 'delete'],
  }, option));

  useHeadersMiddleware(r);
  useBodyMiddleware(r);
  useTimeoutMiddleware(r);
  useBadHTTPMiddleware(r);
  const wrongBusiMiddleware = useWrongBusiMiddleware(r);

  // extend a download method
  r.download = function(method, url, params, roption) {
    const dlFetchId = 'my_download';

    wrongBusiMiddleware.pause(dlFetchId);

    const downHeadersMiddleware = r.use(QuickFetch.REQUEST, (req, next) => {
      req.headers.set('Content-Type', 'application/x-www-form-urlencoded');
      next(req);
    }, dlFetchId);

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
        }
      );
  };

  return r;
};

export default Wrapper;
