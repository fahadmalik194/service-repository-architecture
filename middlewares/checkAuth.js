const Util = require("../utils/Util");
const { LoginRecord } = require("../models/loginRecord.model");
const logger = require("../utils/logger");

module.exports = async function (req, res, next) {
  if (req.session && req.session.auth !== true && !req.isAuthenticated()) {
    res.send(Util.getUnauthorizedRequest("User Not Authenticated!"));
    return false;
  }

  const loginRecordResponse = await LoginRecord.findOne(
    {
      userId: req.session.user.userDetail._id,
      userEmail: req.session.user.userDetail.email,
    }
  )

  if (req.session.user.uuid != loginRecordResponse.userSession) {

    req.session.auth == false;
    req.logout();
    req.session.destroy();

    return false;

  }

  logger.warn(`User Session Created`);
  next();
};
