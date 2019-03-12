import QuickFetch from 'quickfetch';

export default function useHeadersMiddleware(r) {
  // headers
  r.use(QuickFetch.REQUEST, (req, next) => {
    if (/^(get|head|delete)$/i.test(req.method)) {
      req.headers.set('Content-Type', 'application/json');
    } else { 
      req.headers.set('Content-Type', 'application/x-www-form-urlencoded');
    }
    next(req);
  });
}
