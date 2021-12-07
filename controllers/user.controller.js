const express = require("express");
const userService = require("../services/user.service");
const validateObjectId = require("../middlewares/validateObjectId");
const checkAuth = require("../middlewares/checkAuth");
const checkAuthorization = require("../middlewares/checkAuthorization");
const router = express.Router();

router.post("/create", [checkAuth, checkAuthorization], userService.createUser);

router.post("/createWithoutAuth", userService.createUser);

router.post(
  "/get/allUsers",
  [checkAuth, checkAuthorization],
  userService.getAllUsers
);

router.post(
  "/get/allUserList",
  [checkAuth, checkAuthorization],
  userService.getAllUserList
);

router.post(
  "/get/userById/:id",
  [validateObjectId, checkAuth, checkAuthorization],
  userService.getUserById
);

router.post(
  "/update/userById/:id",
  [validateObjectId, checkAuth, checkAuthorization],
  userService.updateUserById
);

router.post(
  "/delete/userById/:id",
  [validateObjectId, checkAuth, checkAuthorization],
  userService.deleteUserById
);

router.post(
  "/delete/statusUserById/:id",
  [validateObjectId, checkAuth, checkAuthorization],
  userService.deleteStatusUserById
);

router.post(
  "/changeAccountStatus/UserById/:id",
  [validateObjectId, checkAuth, checkAuthorization],
  userService.changeAccountStatusById
);

router.post(
  "/assign/roles",
  [checkAuth, checkAuthorization],
  userService.assignRoles
);

router.post(
  "/assign/client",
  [checkAuth, checkAuthorization],
  userService.assignClient
);

router.post(
  "/change/password",
  [checkAuth, checkAuthorization],
  userService.changePassword
);

router.post(
  "/ListAgentsForClientAdmin",
  [checkAuth, checkAuthorization],
  userService.ListAgentsForClientAdmin
);
router.post(
  "/ListClientsForClientAdmin",
  [checkAuth, checkAuthorization],
  userService.ListClientsForClientAdmin
);

router.post(
  "/createAgentByClientAdmin",
  [checkAuth, checkAuthorization],
  userService.createAgentByClientAdmin
);

module.exports = router;
