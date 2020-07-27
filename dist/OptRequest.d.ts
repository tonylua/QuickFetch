import { QFOption } from "./quickfetch";
declare class OptRequest extends Request {
    init: QFOption;
    constructor(req: string | Request, init: QFOption);
    clone(): OptRequest;
}
export default OptRequest;
