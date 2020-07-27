import QuickFetch from "./index";

declare type QFMidTypes =
  | typeof QuickFetch["REQUEST"]
  | typeof QuickFetch["RESPONSE"]
  | typeof QuickFetch["ERROR"];

declare type QFNext = (target: QFCloneable) => any;
declare type QFMidFn = (target: QFCloneable, next: QFNext) => any;

declare type QFFetchID = string | number | symbol;

declare type QFMidWrapper = {
  id: number | string | symbol;
  type: string;
  middleware: QFMidFn;
  disabledUses: any;
  allDisabled?: boolean;
  fetchId?: QFFetchID;
};

declare type QFHeaders = {
  [key: string]: any;
};

declare type QFOption = null | {
  method: string;
  credentials: string;
  mode: string;
  cache: string;
  headers: QFHeaders;
  body?: any;
  endpoint?: string;
  baseURL?: string;
  timeout?: number;
  catchError?: boolean;
  ignoreBodyMethods?: Array<string>;
  forceJSON?: boolean;
  fetchId?: QFFetchID;
  signal?: AbortSignal;
};

declare type QFCloneable = Request | Response | Blob | JSON | Error | QFOption;

declare type QFUseReturnType = void | {
  unuse: () => void;
  pause: (id: number) => void;
  resume: (id: number) => void;
};

declare type QFDoReqFn = (
  this: QuickFetch,
  url: string,
  params: any,
  originOption: Partial<QFOption>
) => Promise<any>;
