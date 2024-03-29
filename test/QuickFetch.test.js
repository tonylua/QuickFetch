import qs from "qs";
import fetch from "jest-fetch-mock";
import QuickFetch from "../src/index.ts";
import CustomError from "../src/CustomError.ts";

const _originFetch = global.fetch;

let qFetch;
beforeEach(() => {
  global.fetch = window.fetch = fetch;
  jest.useFakeTimers();
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.clearAllMocks();
  fetch.mockClear();
  qFetch = null;
  global.fetch = window.fetch = _originFetch;
});

describe("test QuickFetch.js", () => {
  it("可以遍历出正确的方法", () => {
    ["use", "get", "post", "delete", "put", "patch", "sequence"].forEach(
      (method) => {
        expect(QuickFetch.prototype[method]).toBeTruthy();
      }
    );
  });

  it("应该正确响应正常的请求", async (done) => {
    fetch.mockResponses(
      [
        JSON.stringify({
          code: 0,
          msg: "ok",
          data: {
            hello: "everyone!",
          },
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          code: 0,
          msg: "ok",
          data: {
            hello: "everybody!",
          },
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          code: 0,
          msg: "ok",
          data: {
            hello: "bro!",
          },
        }),
        { status: 200 },
      ]
    );

    qFetch = new QuickFetch();

    const res1 = await qFetch.get("/ajax-api/sample/info");
    const json1 = await res1.json();
    expect(json1.data.hello).toEqual("everyone!");

    const res2 = await qFetch.delete("/ajax-api/sample/del");
    const json2 = await res2.json();
    expect(json2.data.hello).toEqual("everybody!");

    const res3 = await qFetch.patch("/ajax-api/sample/hey");
    const json3 = await res3.json();
    expect(json3.data.hello).toEqual("bro!");

    done();
  });

  it("应该正确处理 url 前缀", (done) => {
    qFetch = new QuickFetch({
      baseURL: "/ajax-api",
    });
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      expect(req.url).toEqual("/ajax-api/sample/info2");
      next(req);
    });
    qFetch.get("/sample/info2").finally(() => {
      expect(fetch.mock.calls.length).toBe(1);
      expect(fetch.mock.calls[0][0] instanceof Request).toBeTruthy();
      expect(fetch.mock.calls[0][0].url).toEqual("/ajax-api/sample/info2");
      done();
    });
  });

  it("应该正确处理 endpoint", async () => {
    qFetch = new QuickFetch({
      endpoint: "http://foo.com:7070",
      baseURL: "/my-api",
    });
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      expect(req.url).toEqual("http://foo.com:7070/my-api/sample/info3");
      next(req);
    });
    await qFetch.get("/sample/info3");
    expect(fetch.mock.calls.length).toBe(1);
    expect(fetch.mock.calls[0][0] instanceof Request).toBeTruthy();
    expect(fetch.mock.calls[0][0].url).toEqual(
      "http://foo.com:7070/my-api/sample/info3"
    );
  });

  it("应该正确处理参数", async (done) => {
    fetch.mockResponse(
      JSON.stringify({
        msg: "ok!",
      })
    );

    qFetch = new QuickFetch({
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-I-Love-You": "",
      },
    });

    const obj = { c: 3, d: 4 };

    const res1 = await qFetch.get("/some1", obj);
    expect(fetch.mock.calls[0][0].url).toEqual("/some1?c=3&d=4");
    expect(fetch.mock.calls[0][0].body).toBeFalsy();

    expect(fetch.mock.calls[0][0].headers.get("Cache-Control")).toEqual(
      "no-store"
    );
    expect(
      fetch.mock.calls[0][0].init.headers["Cache-Control"]
    ).toBeUndefined();
    expect(fetch.mock.calls[0][0].init.headers["cache-control"]).toEqual(
      "no-store"
    );
    expect(fetch.mock.calls[0][0].headers.get("X-I-Love-You")).toBeFalsy();
    expect(fetch.mock.calls[0][0].init.headers["x-i-love-you"]).toBeUndefined();

    const res2 = await qFetch.post("/some2", obj);
    expect(fetch.mock.calls[1][0].url).toEqual("/some2");
    expect(fetch.mock.calls[1][0].init.body).toEqual(JSON.stringify(obj));

    const res3 = await qFetch.put("/some3", obj, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    expect(fetch.mock.calls[2][0].headers.get("Cache-Control")).toEqual(
      "no-store"
    );
    expect(fetch.mock.calls[2][0].url).toEqual("/some3");
    expect(fetch.mock.calls[2][0].init.body).toEqual("c=3&d=4");

    const res4 = await qFetch.patch("/some4", obj, {
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
    });
    expect(fetch.mock.calls[3][0].url).toEqual("/some4");
    expect(fetch.mock.calls[3][0].init.body).toEqual(JSON.stringify(obj));

    const res5 = await qFetch.patch("/some5", obj, {
      headers: {
        "Content-Type": "application/alto-netwokmap+json",
      },
    });
    expect(fetch.mock.calls[4][0].url).toEqual("/some5");
    expect(fetch.mock.calls[4][0].init.body).toEqual(JSON.stringify(obj));

    const res6 = await qFetch.put("/some6", obj, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      forceJSON: true, // 强制使用 JSON
    });
    expect(fetch.mock.calls[5][0].url).toEqual("/some6");
    expect(fetch.mock.calls[5][0].init.body).toEqual(JSON.stringify(obj));

    done();
  });

  it("应该正确清理 headers", async (done) => {
    qFetch = new QuickFetch({
      headers: {
        aa: void 0,
        bb: null,
        cc: "",
        dd: 123,
      },
    });
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      expect(req.init.headers.aa).toBeUndefined();
      expect(req.init.headers.bb).toBeUndefined();
      expect(req.init.headers.cc).toBeUndefined();
      expect(req.init.headers.dd).toEqual("123");
      next(req);
      done();
    });
    await qFetch.post("/some6", null);
  });

  it("应该正确合并数组参数", async (done) => {
    qFetch = new QuickFetch({
      arr1: [1, 2],
    });
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      expect(req.init.arr1).toEqual([3, 4]);
      next(req);
      done();
    });
    await qFetch.post("/some6", null, {
      arr1: [3, 4],
    });
  });

  it("应该可以中途取消请求", (done) => {
    fetch.mockResponseOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ body: "okkk" }), 100)
        )
    );

    qFetch = new QuickFetch();
    qFetch.dispatchEvent = jest.fn(); // addEventListener 在测试环境无法正常工作

    const fid2 = "get222";
    qFetch
      .get("/ajax-api/sample/delay", null, {
        fetchId: fid2,
      })
      .catch((ex) => {
        const evt = qFetch.dispatchEvent.mock.calls[0][0];
        expect(evt).toBeInstanceOf(CustomEvent);

        const {
          type,
          detail: { fetchId, signal },
        } = evt;
        expect(type).toEqual(QuickFetch.EVENT_FETCH_ABORT);
        expect(fetchId).toEqual(fid2);
        expect(signal.aborted).toBeTruthy();

        qFetch.dispatchEvent.mockClear();

        done();
      });
    QuickFetch.abort(fid2);
  });

  it("超时应该报错", (done) => {
    jest.useRealTimers();
    fetch.mockResponseOnce(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ body: "ok" }), 100))
    );

    qFetch = new QuickFetch({
      timeout: "5",
    });
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      expect(req.init.timeout).toStrictEqual(5);
      next(req);
    });
    qFetch.get("/ajax-api/sample/delay").catch((err) => {
      expect(err.message).toBe(QuickFetch.EXCEPTION_TIMEOUT);
      done();
    });
  });

  it("屏蔽调用端的报错", (done) => {
    jest.useRealTimers();
    fetch.mockResponseOnce(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ body: "ok" }), 100))
    );

    qFetch = new QuickFetch({
      timeout: 5,
      catchError: false,
    });

    let flag = false;
    qFetch.get("/ajax-api/sample/delay").catch((err) => {
      flag = true;
    });

    setTimeout(() => {
      expect(flag).toBeFalsy();
      done();
    }, 20);
  });

  it("自定义不需要 body 的请求方法", (done) => {
    jest.useRealTimers();
    fetch.mockResponse(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ body: "ok" }), 100))
    );
    qFetch = new QuickFetch({
      ignoreBodyMethods: ["head", "delete"],
      timeout: 5,
    });

    qFetch.delete("/ajax-api/sample/del").catch((err) => {
      expect(err.request.body).toBeFalsy();
      expect(err.request.init.body).toBeFalsy();

      qFetch
        .delete("/ajax-api/sample/del", null, {
          ignoreBodyMethods: ["get", "head"],
        })
        .catch((err) => {
          expect(err.request.body).toBeTruthy();
          expect(err.request.init.body).toBeTruthy();
          done();
        });
    });
  });

  it("中间件：动态改变请求 headers", (done) => {
    jest.useRealTimers();
    fetch.mockResponse(
      () =>
        new Promise((resolve) => setTimeout(() => resolve({ body: "ok" }), 100))
    );

    qFetch = new QuickFetch({
      timeout: 5,
    });

    const obj1 = { a: 1, b: 2 };
    const obj2 = { c: 3, d: 4 };

    let reqFlag = 0;
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      if (reqFlag++ < 1) {
        req.headers.set("Content-Type", "foo");
      } else {
        req.headers.set("Content-Type", "application/json");
      }
      next(req);
    });

    qFetch.post("/aaa", obj1).catch((err) => {
      expect(err.message).toBe(QuickFetch.EXCEPTION_TIMEOUT);

      const request1 = err.data;
      expect(request1.headers.get("Content-Type")).toEqual("foo");
      expect(request1.init.body).toEqual(qs.stringify(obj1));

      qFetch.post("/bbb", obj2).catch((err2) => {
        expect(err2.message).toBe(QuickFetch.EXCEPTION_TIMEOUT);

        const request2 = err2.data;
        expect(request2.headers.get("Content-Type")).toEqual(
          "application/json"
        );
        expect(request2.init.body).toEqual(JSON.stringify(obj2));

        done();
      });
    });
  });

  it("中间件：处理 HTTP 状态", (done) => {
    fetch.mockResponseOnce(
      JSON.stringify({
        code: 0,
        msg: "ok",
        data: {
          hello: "everyone!",
        },
      }),
      { status: 567 }
    );

    const isBadRequest = (status) => status >= 300;

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      const { status } = res;
      if (isBadRequest(status)) {
        next(new Error("ABC" + status.toString()));
        return;
      }
      next(res);
    });

    qFetch.get("/ajax-api/sample/bad").catch((err) => {
      expect(err.message).toBe("ABC567");
      done();
    });
  });

  it("中间件：处理业务逻辑错误", (done) => {
    const URL = "/ajax-api/sample/wrong";

    fetch.mockResponseOnce(
      JSON.stringify({
        code: 20100,
        msg: "wrong!",
      }),
      {
        status: 200,
        url: URL,
      }
    );

    const isValidCode = (code) => {
      const c = parseInt(code, 10);
      return !Number.isNaN(c) && c < 20000;
    };

    const ERROR_BUSINESS = "ERROR_BUSINESS";
    const fn1 = jest.fn();

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.RESPONSE, async (res, next) => {
      const json = await res.clone().json(); // clone() is important!
      const { code } = json;
      if (!isValidCode(code)) {
        const err = new CustomError(ERROR_BUSINESS, {
          response: res,
        });
        next(Promise.reject(err));
        return;
      }
      next(res);
    });
    qFetch.use(QuickFetch.ERROR, async (err, next) => {
      if (err.message === ERROR_BUSINESS) {
        const { response } = err.data;
        const json = await response.clone().json();
        const { code } = json;
        fn1(code);
      }
      next(err);
    });

    qFetch.get(URL).catch((err) => {
      expect(err.message).toBe(ERROR_BUSINESS);
      expect(fn1).toHaveBeenCalledWith(20100);
      expect(err.request).toBeInstanceOf(Request);
      expect(err.data.response).toBeInstanceOf(Response);
      expect(err.request.url).toEqual(err.data.response.url);
      done();
    });
  });

  it("中间件：多个错误只响应第一个", (done) => {
    fetch.mockResponseOnce(
      JSON.stringify({
        code: 20123,
        msg: "not ok",
        data: {},
      }),
      { status: 567 }
    );

    const isBadRequest = (status) => status >= 300;
    const isValidCode = (code) => {
      const c = parseInt(code, 10);
      return !Number.isNaN(c) && c < 20000;
    };
    const ERROR_HTTP = "ERROR_HTTP";
    const ERROR_BUSINESS = "ERROR_BUSINESS";
    const fn1 = jest.fn();

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      const { status } = res;
      if (isBadRequest(status)) {
        const err = new CustomError(ERROR_HTTP, {
          response: res,
        });
        throw err;
        // next(Promise.reject(err));
        return;
      }
      next(res);
    });
    qFetch.use(QuickFetch.ERROR, async (err, next) => {
      if (err.message === ERROR_HTTP) {
        const { status } = err.data.response;
        fn1(status);
      }
      next(err);
    });
    qFetch.use(QuickFetch.RESPONSE, async (res, next) => {
      if (!(res instanceof Response)) {
        next(res);
        return;
      }
      const json = await res.clone().json(); // clone() is important!
      const { code } = json;
      if (!isValidCode(code)) {
        const err = new CustomError(ERROR_BUSINESS, {
          response: res,
        });
        throw err;
        // next(Promise.reject(err));
        return;
      }
      next(res);
    });
    qFetch.use(QuickFetch.ERROR, async (err, next) => {
      if (err.message === ERROR_BUSINESS) {
        const { response } = err.data;
        const json = await response.clone().json();
        const { code } = json;
        fn1(code);
      }
      next(err);
    });

    qFetch.post("/foo/bar").finally(() => {
      expect(fn1.mock.calls.length).toBe(1);
      expect(fn1.mock.calls[0][0]).toEqual(567);
      done();
    });
  });

  it("中间件：在 response 中获知 method", (done) => {
    fetch.mockResponse(
      JSON.stringify({
        msg: "ok!",
      })
    );

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      expect(res.method).toEqual("PUT");
      next(res);

      done();
    });

    qFetch.put("/ajax-api/sample/some", null);
  });

  it("中间件：在 response 中获知请求的 headers", (done) => {
    fetch.mockResponse(
      JSON.stringify({
        msg: "ok!",
      })
    );

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      expect(res.requestHeaders).toBeTruthy();
      if (res.method === "GET") {
        expect(res.requestHeaders.get("Content-Type")).toEqual(
          "application/vnd.ms-excel"
        );
      }
      if (res.method === "PUT") {
        expect(res.requestHeaders.get("X-Header-Param-1")).toEqual("hello");
      }
      if (res.method === "DELETE") {
        expect(res.requestHeaders.get("X-Header-Param-1")).toEqual("world");
      }
      next(res);

      done();
    });

    qFetch.get("/ajax-api/sample/xxx", null, {
      headers: {
        "Content-Type": "application/vnd.ms-excel",
      },
    });
    qFetch.put("/ajax-api/sample/foo", null, {
      headers: {
        "X-Header-Param-1": "hello",
      },
    });
    qFetch.delete("/ajax-api/sample/bar", null, {
      headers: {
        "X-Header-Param-1": "world",
      },
    });
  });

  it("中间件：只对特定 fetch 请求生效的", () => {
    const fn1 = jest.fn();

    const specialFetchId = "wewfe88";
    const specialFetchId2 = 999;

    qFetch = new QuickFetch();
    qFetch.use(
      QuickFetch.REQUEST,
      (req, next) => {
        fn1();
        next(req);
      },
      specialFetchId
    );

    qFetch.put("/ajax-api/sample/some", null, { fetchId: specialFetchId2 });
    expect(fn1).not.toHaveBeenCalled();

    fn1.mockClear();

    qFetch.put("/ajax-api/sample/some", null, { fetchId: specialFetchId });
    expect(fn1).toHaveBeenCalled();

    fn1.mockClear();

    qFetch.put("/ajax-api/sample/some");
    expect(fn1).not.toHaveBeenCalled();
  });

  it("中间件：撤销已设置的", (done) => {
    fetch.mockResponseOnce(
      JSON.stringify({
        msg: "okya",
      }),
      { status: 567 }
    );

    const isBadRequest = (status) => status >= 300;

    qFetch = new QuickFetch();
    const middleware1 = qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      const { status } = res;
      if (isBadRequest(status)) {
        next(new Error("ABC" + status.toString()));
        return;
      }
      next(res);
    });

    middleware1.unuse();

    const spy = jest.fn();
    qFetch
      .get("/ajax-api/sample/bad")
      .catch(spy)
      .finally(() => {
        expect(spy).not.toHaveBeenCalled();
        done();
      });
  });

  it("中间件：暂停与恢复", () => {
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

    qFetch.get("/ajax-api/sample/some");
    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
    fn1.mockClear();
    fn2.mockClear();

    middleware1.pause();

    qFetch.get("/ajax-api/sample/some");
    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
    fn1.mockClear();
    fn2.mockClear();

    middleware1.resume();

    qFetch.get("/ajax-api/sample/some");
    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });

  it("中间件：对特定 fetch 请求的暂停与恢复", () => {
    const fn1 = jest.fn();

    const specialFetchId = "#$DS@-GG@&=SF";

    qFetch = new QuickFetch();
    const middleware1 = qFetch.use(QuickFetch.REQUEST, (req, next) => {
      fn1();
      next(req);
    });
    middleware1.pause(specialFetchId);

    qFetch.get("/ajax-api/sample/some");
    expect(fn1).toHaveBeenCalled();
    fn1.mockClear();

    qFetch.get("/ajax-api/sample/some", null, { fetchId: specialFetchId });
    expect(fn1).not.toHaveBeenCalled();

    middleware1.resume(specialFetchId);

    qFetch.get("/ajax-api/sample/some", null, { fetchId: specialFetchId });
    expect(fn1).toHaveBeenCalled();
  });

  it("多个请求串行发送批量返回", (done) => {
    fetch.mockResponses(
      [
        JSON.stringify({
          msg: "ok1",
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          msg: "ok2",
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          msg: "ok3",
        }),
        { status: 200 },
      ]
    );

    qFetch = new QuickFetch();
    qFetch
      .sequence([
        qFetch.get("/some1"),
        qFetch.post("/some2"),
        qFetch.put("/some3"),
      ])
      .then(async (resArr) => {
        expect(resArr.length).toBe(3);

        const json1 = await resArr[0].json();
        const json2 = await resArr[1].json();
        const json3 = await resArr[2].json();

        expect(json1.msg).toEqual("ok1");
        expect(json2.msg).toEqual("ok2");
        expect(json3.msg).toEqual("ok3");

        done();
      });
  });

  it("多个请求串行发送时的失败", (done) => {
    fetch.mockResponses(
      [
        JSON.stringify({
          msg: "ok111",
        }),
        { status: 200 },
      ],
      [
        JSON.stringify({
          msg: "ok222",
        }),
        { status: 508 },
      ],
      [
        JSON.stringify({
          msg: "ok333",
        }),
        { status: 200 },
      ]
    );

    const isBadRequest = (status) => status >= 300;

    qFetch = new QuickFetch();
    qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      const { status } = res;
      if (isBadRequest(status)) {
        next(new Error("HTTP" + status.toString()));
        return;
      }
      next(res);
    });

    const fn1 = jest.fn();
    const fn2 = jest.fn();

    qFetch
      .sequence([
        qFetch.get("/some1"),
        qFetch.post("/some2"),
        qFetch.put("/some3"),
      ])
      .then((resArr) => {
        fn1();
      })
      .catch((ex) => {
        fn2(ex.message);
      })
      .finally(() => {
        expect(fn1).not.toHaveBeenCalled();
        expect(fn2).toHaveBeenCalledWith("HTTP508");
        done();
      });
  });

  it("发送统计信息", async (done) => {
    fetch.mockResponses(
      [],
      [
        JSON.stringify({
          msg: "ok ping",
        }),
        { status: 200 },
      ]
    );

    qFetch = new QuickFetch();

    const ng = navigator || {};
    ng.sendBeacon = jest.fn();
    qFetch.ping("/ajax-api/sample/ping", { a: 1 });
    expect(ng.sendBeacon).toHaveBeenCalled();
    delete ng.sendBeacon;

    if (navigator) {
      delete navigator.sendBeacon;
    }
    qFetch.use(QuickFetch.REQUEST, (req, next) => {
      expect(req.init.keepalive).toBe(true);
      next(req);
    });
    qFetch.use(QuickFetch.RESPONSE, (res, next) => {
      expect(res.method).toEqual("POST");
      next(res);

      done();
    });
    const res2 = await qFetch.ping("/ajax-api/sample/ping", { a: 1 });
    const json2 = await res2.json();
    expect(json2.msg).toEqual("ok ping");
  });
});
