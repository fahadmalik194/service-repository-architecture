const Response = require("./Response");
const Constant = require("./Constant");
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
("use strict");
class Util {
  static getOkRequest(data, msg) {
    const response = new Response();
    response.setData(data);
    response.setMessage(msg);
    response.setStatus(Constant.SUCCESS);
    response.setStatusCode(StatusCodes.OK);
    return response;
  }
  static getOkRequestTotal(data, msg) {
    const response = new Response();
    response.setData(data);
    response.setMessage(msg);
    response.setTotalResults(data);
    response.setStatus(Constant.SUCCESS);
    response.setStatusCode(StatusCodes.OK);
    return response;
  }
  static getSimpleOkRequest(msg) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.SUCCESS);
    response.setStatusCode(StatusCodes.OK);
    return response;
  }
  static getBadRequest(msg) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.BAD_REQUEST);
    return response;
  }
  static getNotContentRequest(msg) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.SUCCESS);
    response.setStatusCode(StatusCodes.NO_CONTENT);
    return response;
  }
  static getUnauthorizedRequest(msg, res) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.UNAUTHORIZED);
    return response;
  }
  static getForbiddenRequest(msg) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.FORBIDDEN);
    return response;
  }

  static getISERequest(msg) {
    const response = new Response();
    response.setMessage(msg);
    response.setStatus(Constant.FAIL);
    response.setStatusCode(StatusCodes.INTERNAL_SERVER_ERROR);
    return response;
  }
}
module.exports = Util;
