import qs from 'qs';
import fetch from 'jest-fetch-mock';
import QuickFetch from '../src/QuickFetch';

const _originFetch = global.fetch;

let qFetch;
beforeEach(() => {
  global.fetch = window.fetch = fetch;
});
afterEach(() => {
  fetch.mockClear();
  qFetch = null;
  global.fetch = window.fetch = _originFetch;
});

describe('test QuickFetch.js', () => {
  
  it('可以遍历出正确的方法', () => {
    qFetch = new QuickFetch();

    const keys = [];
    for (const key in qFetch) {
      keys.push(key);
    }

    expect(
      ['use', 'get', 'post', 'delete', 'put', 'patch', 'sequence'].every(
        method => ~keys.indexOf(method)
      )
    ).toBeTruthy();

    expect(
      keys.every(key => key !== 'constructor' && !/^_/.test(key))
    ).toBeTruthy();
  });

  it('应该正确响应正常的请求', (done) => {
    fetch.mockResponseOnce(
      JSON.stringify({
        code: 0,
        msg: 'ok',
        data: {
          hello: 'everyone!'
        }
      }),
      { status: 200 }
    );

    qFetch = new QuickFetch();
    qFetch.get('/ajax-api/sample/info').then(
      async (res) => {
        const json = await res.json();
        expect(json.data.hello).toEqual('everyone!');
        done();
      }
    );
  });

  it('应该正确处理 url 前缀', (done) => {
    qFetch = new QuickFetch({
      baseURL: '/ajax-api'
    });
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      expect(req.url).toEqual('/ajax-api/sample/info2');
      next(req);
    });
    qFetch.get('/sample/info2').finally(
      () => {
        expect(fetch.mock.calls.length).toBe(1);
        expect(fetch.mock.calls[0][0] instanceof Request).toBeTruthy();
        expect(fetch.mock.calls[0][0].url).toEqual('/ajax-api/sample/info2');
        done();
      }
    );
  });

  it('应该正确处理参数', async (done) => {
    fetch.mockResponse(
      JSON.stringify({
        msg: 'ok!'
      })
    );

    qFetch = new QuickFetch({
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });

    const obj = { c: 3, d: 4 };

    const res1 = await qFetch.get('/some1', obj);
    expect(fetch.mock.calls[0][0].url).toEqual('/some1?c=3&d=4');
    expect(fetch.mock.calls[0][0].body).toBeFalsy();

    const res2 = await qFetch.post('/some2', obj);
    expect(fetch.mock.calls[1][0].url).toEqual('/some2');
    expect(fetch.mock.calls[1][0].body).toEqual(JSON.stringify(obj));

    const res3 = await qFetch.put('/some3', obj, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    expect(fetch.mock.calls[2][0].headers.get('Cache-Control')).toEqual('no-store');
    expect(fetch.mock.calls[2][0].url).toEqual('/some3');
    expect(fetch.mock.calls[2][0].body).toEqual('c=3&d=4');

    done();
  });

  it('超时应该报错', (done) => {
    fetch.mockResponseOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ body: 'ok' }), 100))
    );

    qFetch = new QuickFetch({
      timeout: 5
    });

    qFetch.get('/ajax-api/sample/delay').catch((err) => {
      expect(err.message).toBe(QuickFetch.EXCEPTION_TIMEOUT);
      done();
    });
  });

  it('屏蔽调用端的报错', (done) => {
    fetch.mockResponseOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ body: 'ok' }), 100))
    );

    qFetch = new QuickFetch({
      timeout: 5,
      catchError: false
    });

    let flag = false;
    qFetch.get('/ajax-api/sample/delay').catch((err) => {
      flag = true;
    });

    setTimeout(() => {
      expect(flag).toBeFalsy();
      done();
    }, 20);
  });

  it('中间件：动态改变请求 headers', (done) => {
    fetch.mockResponse(
      () => new Promise(resolve => setTimeout(() => resolve({ body: 'ok' }), 100))
    );

    qFetch = new QuickFetch({
      timeout: 5
    });

    const obj1 = {a: 1, b: 2};
    const obj2 = {c: 3, d: 4};

    let reqFlag = 0;
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      if (reqFlag++ < 1) {
        req.headers.set('Content-Type', 'foo');
      } else {
        req.headers.set('Content-Type', 'application/json');
      }
      next(req);
    });

    qFetch.post('/aaa', obj1).catch((err) => {
      expect(err.message).toBe(QuickFetch.EXCEPTION_TIMEOUT);

      const request1 = err.data;
      expect(request1.headers.get('Content-Type')).toEqual('foo');
      expect(request1.body).toEqual(qs.stringify(obj1));
      
      qFetch.post('/bbb', obj2).catch((err2) => {
        expect(err2.message).toBe(QuickFetch.EXCEPTION_TIMEOUT);
        
        const request2 = err2.data;
        expect(request2.headers.get('Content-Type')).toEqual('application/json');
        expect(request2.body).toEqual(JSON.stringify(obj2));

        done();
      });
    });
  });

  it('中间件：处理 HTTP 状态', (done) => {
    fetch.mockResponseOnce(
      JSON.stringify({
        code: 0,
        msg: 'ok',
        data: {
          hello: 'everyone!'
        }
      }),
      { status: 567 }
    );

    const isBadRequest = status => status >= 300;

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      const { status } = res;
      if (isBadRequest(status)) {
        next(new Error('ABC' + status.toString()));
        return;
      }
      next(res);
    });

    qFetch.get('/ajax-api/sample/bad').catch((err) => {
      expect(err.message).toBe('ABC567');
      done();
    });
  });

  it('中间件：处理业务逻辑错误', (done) => {
    fetch.mockResponseOnce(
      JSON.stringify({
        code: 20100,
        msg: 'wrong!'
      }),
      { status: 200 }
    );

    const isValidCode = (code) => {
      const c = parseInt(code, 10);
      return (!Number.isNaN(c)) && (c < 20000);
    };

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      if (res instanceof Response) {
        // clone() is important!
        return res.clone().json().then((json) => {
          const { code } = json;
          if (!isValidCode(code)) {
            next(new Error('DEF' + code.toString()));
            return;
          }
          next(res);
        });
      }
      next(res);
    });

    qFetch.get('/ajax-api/sample/wrong').catch((err) => {
      expect(err.message).toBe('DEF20100');
      done();
    });
  });

  it('中间件：只对特定 fetch 请求生效的', () => {
    const fn1 = jest.fn();

    const specialFetchId = 'wewfe88';
    const specialFetchId2 = 999;

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      fn1();
      next(req);
    }, specialFetchId);

    qFetch.put('/ajax-api/sample/some', null, { fetchId: specialFetchId2 });
    expect(fn1).not.toHaveBeenCalled();

    fn1.mockClear();

    qFetch.put('/ajax-api/sample/some', null, { fetchId: specialFetchId });
    expect(fn1).toHaveBeenCalled();

    fn1.mockClear();

    qFetch.put('/ajax-api/sample/some');
    expect(fn1).not.toHaveBeenCalled();
  });

  it('中间件：撤销已设置的', (done) => {
    fetch.mockResponseOnce(
      JSON.stringify({
        msg: 'okya'
      }),
      { status: 567 }
    );

    const isBadRequest = status => status >= 300;

    qFetch = new QuickFetch();
    const middleware1 = qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      const { status } = res;
      if (isBadRequest(status)) {
        next(new Error('ABC' + status.toString()));
        return;
      }
      next(res);
    });
    
    middleware1.unuse();
    
    const spy = jest.fn();
    qFetch.get('/ajax-api/sample/bad')
      .catch(spy)
      .finally(() => {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
  });

  it('中间件：暂停与恢复', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();

    qFetch = new QuickFetch();
    const middleware1 = qFetch.use(QuickFetch.REQUEST, (req, next) => {
      fn1();
      next(req);
    });
    const middleware2 = qFetch.use(QuickFetch.REQUEST, (req, next) => {
      fn2();
      next(req);
    });
    
    qFetch.get('/ajax-api/sample/some');
    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
    fn1.mockClear();
    fn2.mockClear();

    middleware1.pause();
    
    qFetch.get('/ajax-api/sample/some');
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
    fn1.mockClear();
    fn2.mockClear();

    middleware1.resume();

    qFetch.get('/ajax-api/sample/some');
    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });

  it('中间件：对特定 fetch 请求的暂停与恢复', () => {
    const fn1 = jest.fn();

    const specialFetchId = '#$DS@-GG@&=SF';

    qFetch = new QuickFetch();
    const middleware1 = qFetch.use(QuickFetch.REQUEST, (req, next) => {
      fn1();
      next(req);
    });
    middleware1.pause(specialFetchId);
    
    qFetch.get('/ajax-api/sample/some');
    expect(fn1).toHaveBeenCalled();
    fn1.mockClear();

    qFetch.get('/ajax-api/sample/some', null, {fetchId: specialFetchId});
    expect(fn1).not.toHaveBeenCalled();

    middleware1.resume(specialFetchId);

    qFetch.get('/ajax-api/sample/some', null, {fetchId: specialFetchId});
    expect(fn1).toHaveBeenCalled();
  });

  it ('多个请求串行发送批量返回', (done) => {
    fetch.mockResponses([
      JSON.stringify({
        msg: 'ok1'
      }),
      { status: 200 }
    ],[
      JSON.stringify({
        msg: 'ok2'
      }),
      { status: 200 }
    ],[
      JSON.stringify({
        msg: 'ok3'
      }),
      { status: 200 }
    ]);

    qFetch = new QuickFetch();
    qFetch.sequence([
      qFetch.get('/some1'),
      qFetch.post('/some2'),
      qFetch.put('/some3')
    ]).then(
      async (resArr) => {
        expect(resArr.length).toBe(3);

        const json1 = await resArr[0].json();
        const json2 = await resArr[1].json();
        const json3 = await resArr[2].json();
        
        expect(json1.msg).toEqual('ok1');
        expect(json2.msg).toEqual('ok2');
        expect(json3.msg).toEqual('ok3');

        done();
      }
    );
  });

  it ('多个请求串行发送时的失败', (done) => {
    fetch.mockResponses([
      JSON.stringify({
        msg: 'ok111'
      }),
      { status: 200 }
    ],[
      JSON.stringify({
        msg: 'ok222'
      }),
      { status: 508 }
    ],[
      JSON.stringify({
        msg: 'ok333'
      }),
      { status: 200 }
    ]);

    const isBadRequest = status => status >= 300;

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      const { status } = res;
      if (isBadRequest(status)) {
        next(new Error('HTTP' + status.toString()));
        return;
      }
      next(res);
    });

    const fn1 = jest.fn();
    const fn2 = jest.fn();

    qFetch.sequence([
      qFetch.get('/some1'),
      qFetch.post('/some2'),
      qFetch.put('/some3')
    ]).then(
      (resArr) => {
        fn1();
      }
    ).catch(
      ex => {
        fn2(ex.message);
      }
    ).finally(
      () => {
        expect(fn1).not.toHaveBeenCalled();
        expect(fn2).toHaveBeenCalledWith('HTTP508');
        done();
      }
    );
  });

});