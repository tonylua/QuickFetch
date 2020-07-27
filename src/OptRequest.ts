import { _getLatestHeaders } from "./utils";
import { QFOption } from "./quickfetch";

class OptRequest extends Request {
  init: QFOption;
  constructor(req: string | Request, init: QFOption) {
    super(req, init as any);
    this.init = init;
  }
  clone() {
    if (this.init) {
      this.init.headers = _getLatestHeaders(this);
    }
    return new OptRequest(super.clone(), this.init);
  }
}

export default OptRequest;
