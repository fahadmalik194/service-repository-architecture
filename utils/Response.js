class Response {
  constructor(status, statusCode, message, data, totalResults) {
    this.status = status;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.totalResults = data;
  }
  setMessage(message) {
    this.message = message;
  }
  getMessage() {
    return this.message;
  }
  setTotalResults(data) {
    if (data.message.length > 0) {
      this.totalResults = data.message.length;
    } else {
      this.totalResults = 0;
    }
  }
  getTotalResults() {
    return this.totalResults;
  }
  setStatus(status) {
    this.status = status;
  }
  getStatus() {
    return this.status;
  }
  setData(data) {
    this.data = data;
  }
  getData() {
    return this.data;
  }
  setStatusCode(statusCode) {
    this.statusCode = statusCode;
  }
  getStatusCode() {
    return this.statusCode;
  }
}

module.exports = Response;
