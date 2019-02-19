class CustomError extends Error {
  constructor(message, data) {
    super(message);
    this.data = data;
  }
}

export default CustomError;
