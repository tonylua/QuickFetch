declare class CustomError extends Error {
    data: any;
    constructor(message: string, data: any);
}
export default CustomError;
