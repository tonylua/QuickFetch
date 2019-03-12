import QuickFetch from 'quickfetch';

export default function useHeadersMiddleware(r) {
  // body
  r.use(QuickFetch.REQUEST, (req, next) => {
    // delete 定义特殊的 Request
    if (req.method === 'DELETE') {
      const { 
        url,
        cache, credentials, headers, integrity, method,
        mode, redirect, referrer, referrerPolicy
      } = req;

      const { body } = req.init;

      const divSign = ~url.indexOf('?') ? '&' : '?';
      let newURL = url;
      if (body) {
        newURL += `/delete${divSign}${body}`.replace(/\/+/g, '/');
        delete req.init.body;
      }

      const newOpt = {
        ...req.init,
        cache,
        credentials,
        headers,
        integrity,
        method,
        mode,
        redirect,
        referrer,
        referrerPolicy
      };

      const OptRequest = req.constructor;
      const newReq = new OptRequest(newURL, newOpt);
      
      next(newReq);
      return;
    }
    next(req);
  });
}
