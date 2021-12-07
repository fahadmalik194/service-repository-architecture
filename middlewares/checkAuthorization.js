const { getUserData } = require("../utils/GetUserData");
const Util = require("../utils/Util");
const validationEnums = require("./validationEnum");
const logger = require("../utils/logger");

module.exports = async function (req, res, next) {
  if (req.session && req.session.auth == true) {
    logger.error("****************************");
    logger.warn(`User Email: ${req.session.user.userDetail.email}`);
    logger.error("****************************");
    const userData = await getUserData(req.session.user.userDetail.email);
    var requestUrl = req.baseUrl + req.route.path;
    requestUrl = requestUrl.replace("/api", "");
    var returned = false;
    var permittedEndpoints = [];
    userData.role.forEach((role) => {
      role.permissionGroup.forEach((permissionGroup) => {
        if (
          permissionGroup.permissionGroupName ==
          validationEnums.PERMISSIONGROUP_ROOT
        ) {
          logger.info("User has root access");
          next();
          returned = true;
        }
      });
    });

    if (!returned) {
      userData.role.forEach((role) => {
        role.permissionGroup.forEach((permissionGroup) => {
          var selectedPermissions = permissionGroup.permissions;
          for (let item of selectedPermissions) {
            permittedEndpoints.push(item.endpoint);
            // // console.log(item.endpoint);
          }
        });
      });

      if (permittedEndpoints.indexOf(requestUrl) === -1) {
        // // console.log(
        //   `Your Are Not Authorized to Access this Resource ${requestUrl}`
        // );
        logger.error(
          `Your Are Not Authorized to Access this Resource ${requestUrl}`
        );

        return res.send(
          Util.getBadRequest(
            `Your Are Not Authorized to Access this Resource ${requestUrl}`
          )
        );
      } else {
        logger.info(`Resource Accessed ${requestUrl}`);
        // // console.log(`Resource Accessed ${requestUrl}`);
        returned = true;
        next();
      }
    }
  } else {
    return res.send(Util.getBadRequest(`Session Timedout`));
  }
};
