class CustomError extends Error {
  constructor(message, data) {
    super(message);
    this.data = data;
  }
  // clone() {
//     const c = new CustomError(this.message, this.data);
// 		if (this.request) {
// 			c.request = this.request.clone();
// 		}
// 		return c;
//   }
}

export default CustomError;
