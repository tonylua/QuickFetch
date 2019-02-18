import { _getLastestHeaders } from './utils';

class OptRequest extends Request {
  constructor(input, init) {
    super(input, init);
    this.init = init;
  }
  clone() {
    this.init.headers = _getLastestHeaders(this);
    return new OptRequest(this, this.init);
  }
}

export default OptRequest;