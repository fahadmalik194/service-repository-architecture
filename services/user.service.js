const mongoose = require("mongoose");
const { User, validateUser } = require("../models/user.model");
const userFunctions = require("../functions/user.function");
const userEnums = require("../enums/user.enum");
const { GlobalSettings } = require("../models/globalSettings.model");
const crypto = require("crypto");
const Util = require("../utils/Util");
const { Agent } = require("../models/agent.model");
const enums = require("../enums/enum");
const { Client } = require("../models/client.model");
const agentFunctions = require("../functions/agent.function");
const validationEnums = require("../middlewares/validationEnum");
const { Role, validateRole } = require("../models/role.model");

async function createUser(req, res) {
  const session = await mongoose.startSession();
  const { error } = validateUser(req.body);
  if (error) return res.send(Util.getBadRequest(error.details[0].message));
  try {
    const user = await userFunctions.createAndSave(req.body, session);
    return res.send(Util.getOkRequest(user, "User Created Successfully"));
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function getAllUsers(req, res) {
  const session = await mongoose.startSession();
  try {
    var pageNo = parseInt(req.query.pageNo);
    var size = parseInt(req.query.size);
    var query = {};
    if (!pageNo) {
      pageNo = 1;
    }
    if (!size) {
      size = 10;
    }
    query.skip = size * (pageNo - 1);
    query.limit = size;

    User.find({}, {}, query)
      .populate({
        path: "role",
        select: "-__v -enable -deleted -created_at -updated_at",
        populate: [
          {
            path: "permissionGroup",
            select: "-__v -enable -deleted -created_at -updated_at",
            populate: [
              {
                path: "permissions",
                select: "-__v -enable -deleted -created_at -updated_at",
              },
            ],
          },
        ],
      })
      .populate({
        path: "client",
        select: "-__v -enable -deleted -created_at -updated_at",
      })
      .populate({
        path: "serviceGroup",
        select: "-__v -enable -deleted -created_at -updated_at",
      })
      .sort({ name: 1 })
      .then((result) => {
        return res.send(
          Util.getOkRequest(
            result,
            "Users Listing Fetched Successfully"
          )
        );
      })
      .catch((error) => {
        return res.send(Util.getBadRequest(error.message));
      });
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function getAllUserList(req, res) {
  const session = await mongoose.startSession();
  try {
    User.find({})
      .where("enable")
      .equals(true)
      .populate({
        path: "role",
        select: "-__v -enable -deleted -created_at -updated_at",
        populate: [
          {
            path: "permissionGroup",
            select: "-__v -enable -deleted -created_at -updated_at",
            populate: [
              {
                path: "permissions",
                select: "-__v -enable -deleted -created_at -updated_at",
              },
            ],
          },
        ],
      })
      .populate({
        path: "client",
        select: "-__v -enable -deleted -created_at -updated_at",
      })
      .sort({ name: 1 })
      .then((result) => {
        return res.send(
          Util.getOkRequest(
            result,
            "Users Listing Fetched Successfully"
          )
        );
      })
      .catch((error) => {
        return res.send(Util.getBadRequest(error.message));
      });
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function getUser(req, res, filter) {
  const session = await mongoose.startSession();
  try {
    const user = await User.findOne(filter)
      .populate({
        path: "role",
        select: "-__v -enable -deleted -created_at -updated_at",
        populate: [
          {
            path: "permissionGroup",
            select: "-__v -enable -deleted -created_at -updated_at",
            populate: [
              {
                path: "permissions",
                select: "-__v -enable -deleted -created_at -updated_at",
              },
            ],
          },
        ],
      })
      .populate({
        path: "client",
        select: "-__v -enable -deleted -created_at -updated_at",
      });
    if (!user)
      return res.send(Util.getBadRequest("User Not Found with given id"));
    return res.send(
      Util.getOkRequest(user, "User Details Fetched Successfully")
    );
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

function getUserById(req, res) {
  getUser(req, res, { _id: req.params.id, enable: true });
}

async function updateUserById(req, res) {
  const session = await mongoose.startSession();
  try {
    const _id = req.params.id;
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      userEnums.NAME,
      userEnums.USER_NAME,
      userEnums.EMAIL,
      userEnums.PASSWORD,
      userEnums.PHONE_NUMBER,
      userEnums.PROFILE_PICTURE,
    ];
    const isValidOperation = updates.every((update) => {
      return allowedUpdates.includes(update);
    });
    if (!isValidOperation) {
      return res.send(Util.getBadRequest("Invalid Updates!"));
    }
    try {
      const responseData = await User.findByIdAndUpdate(_id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!responseData) {
        return res.send(
          Util.getBadRequest("Cannot Update User: No User Found")
        );
      }
      return res.send(
        Util.getOkRequest(responseData, "User Updated Successfully")
      );
    } catch (error) {
      return res.send(Util.getBadRequest(error.message));
    }
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function deleteUserById(req, res) {
  const session = await mongoose.startSession();
  try {
    const _id = req.params.id;
    const responseData = await User.findByIdAndDelete(_id);
    if (!responseData) {
      return res.send(
        Util.getBadRequest("Cannot Delete User: No User Found")
      );
    }
    return res.send(
      Util.getOkRequest(responseData, "User Deleted Successfully")
    );
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function deleteStatusUserById(req, res) {
  const session = await mongoose.startSession();
  try {
    const _id = req.params.id;
    const responseData = await User.findByIdAndUpdate(
      _id,
      { deleted: req.body.status },
      { new: true, runValidators: true }
    );
    if (!responseData) {
      return res.send(
        Util.getBadRequest(
          "Cannot Delete User: No User Found By Given ID"
        )
      );
    }
    return res.send(
      Util.getOkRequest(responseData, "User Deleted Successfully")
    );
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function changeAccountStatusById(req, res) {
  const session = await mongoose.startSession();
  try {
    const _id = req.params.id;
    const responseData = await User.findByIdAndUpdate(
      _id,
      { enable: req.body.status },
      { new: true, runValidators: true }
    );
    if (!responseData) {
      return res.send(
        Util.getBadRequest(
          "Cannot Change User Status: No User Found By Given ID"
        )
      );
    }
    return res.send(
      Util.getOkRequest(responseData, "User Status Changed Successfully")
    );
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function assignRoles(req, res) {
  const session = await mongoose.startSession();
  try {
    const responseData = await userFunctions.assignRoles(req.body, session);
    return res.send(
      Util.getOkRequest(responseData, "Assign Roles Successfully")
    );
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function assignClient(req, res) {
  const session = await mongoose.startSession();
  try {
    const responseData = await userFunctions.assignClient(
      req.body,
      session
    );
    if (!responseData) {
      return res.send(Util.getBadRequest("No User Found With Given ID"));
    }
    return res.send(
      Util.getOkRequest(responseData, "Assign Client Successfully")
    );
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function changePassword(req, res) {
  const session = await mongoose.startSession();
  try {
    const currentPassword = crypto
      .createHash("sha1")
      .update(req.body.currentPassword)
      .digest("hex");
    const newPassword = crypto
      .createHash("sha1")
      .update(req.body.newPassword)
      .digest("hex");
    const user = await User.findOne({})
      .where("_id")
      .equals(req.body.userId)
      .where("password")
      .equals(currentPassword);
    if (!user) {
      return res.send(
        Util.getBadRequest("Please Enter Your Current Password")
      );
    }
    const responseData = await User.findByIdAndUpdate(
      user._id,
      { password: newPassword },
      { new: true }
    );
    if (!responseData) {
      return res.send(
        Util.getBadRequest(
          "Internal Server Error: Cannot Update Password"
        )
      );
    }
    return res.send(
      Util.getOkRequest(responseData, "Password Updated Successfully")
    );
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function ListAgentsForClientAdmin(req, res) {
  const session = await mongoose.startSession();
  try {
    const userDetail = await User.findById({
      _id: req.body.userId,
      enable: true,
    })
      .populate({
        path: "role",
        select: "-__v -enable -deleted -created_at -updated_at",
      })
      .populate({
        path: "client",
        select: "-__v -enable -deleted -created_at -updated_at",
      })
      .sort({ name: 1 });

    if (userDetail) {
      var globalsettings;

      await Promise.all(
        userDetail.role.map(async (role) => {
          if (
            role.roleName == enums.CLIENT_ADMIN ||
            role.roleName == enums.SUPER_ADMIN
          ) {
            globalsettings = await GlobalSettings.findOne()
              .where("key")
              .equals(role.roleName);
          } else {
            globalsettings.key = null;
          }
        })
      );

      if (
        enums.CLIENT_ADMIN == globalsettings.key ||
        enums.SUPER_ADMIN == globalsettings.key
      ) {
        var clientsIdArray = [];
        await Promise.all(
          userDetail.client.map(async (client) => {
            clientsIdArray.push(client._id);
          })
        );
        if (clientsIdArray.length) {
          var assignedAgentsObj = [];
          var pageNo = parseInt(req.query.pageNo);
          var size = parseInt(req.query.size);
          var query = {};
          if (!pageNo) {
            pageNo = 1;
          }
          if (!size) {
            size = 10;
          }
          query.skip = size * (pageNo - 1);
          query.limit = size;

          await Promise.all(
            clientsIdArray.map(async (id) => {
              const agentData = await Agent.find({}, {}, query)
                .where("client")
                .equals(id)
                .populate({
                  path: "client",
                  select: "-__v -enable -deleted -created_at -updated_at",
                })
                .populate({
                  path: "serviceGroup",
                  select: "-__v -enable -deleted -created_at -updated_at",
                });
              assignedAgentsObj.push(agentData);
              console.log("Agent Datadddddddddddd", agentData);
            })
          );
          return res.send(
            Util.getOkRequest(
              assignedAgentsObj,
              "Agent List Assined to Client Admin Fetched Correctly!"
            )
          );
        } else {
          return res.send(
            Util.getBadRequest(
              "No Clients Assigned to given Client Admin"
            )
          );
        }
      } else {
        return res.send(
          Util.getBadRequest("Given User is not Client Admin")
        );
      }
    } else {
      return res.send(
        Util.getBadRequest("No User Found Against Given User Id")
      );
    }
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function ListClientsForClientAdmin(req, res) {
  const session = await mongoose.startSession();
  try {
    const userDetail = await User.findById({
      _id: req.body.userId,
      enable: true,
    })

      .populate({
        path: "client",
        populate: { path: "serviceGroup" },
        select: "-__v -enable -deleted -created_at -updated_at",
      })
      .sort({ name: 1 });

    if (userDetail) {
      var clientsArray = [];
      await Promise.all(
        userDetail.client.map(async (client) => {
          clientsArray.push(client);
        })
      );

      return res.send(
        Util.getOkRequest(
          userDetail,
          "Client List Assined to Client Admin Fetched Correctly!"
        )
      );
    } else {
      return res.send(
        Util.getBadRequest("No Clients Assigned to given Client Admin")
      );
    }
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

async function createAgentByClientAdmin(req, res) {
  const session = await mongoose.startSession();
  try {
    const reqObj = {
      userId: req.body.userId,
      roleName: enums.CLIENT_ADMIN,
    };
    const userDetail = await userFunctions.checkUserRole(reqObj, session);

    if (userDetail) {
      const clientDetail = await Client.findOne()
        .where("_id")
        .equals(req.body.clientId);
      if (clientDetail) {
        var agentArray = [];
        const agentData = await Agent.find()
          .where("client")
          .equals(clientDetail._id);
        agentArray.push(agentData);

        if (agentArray.length >= clientDetail.noOfAgentsAssigned) {
          return res.send(
            Util.getBadRequest(
              "Cannot Create Agent, Client has maximum agents assigned!"
            )
          );
        }

        const agent = await agentFunctions.createAndSave(
          req.body,
          session
        );
        const agentRole = await Role.findOne()
          .where("roleName")
          .equals(validationEnums.ROLE_AGENT);
        const assignRoleObj = {
          agentId: agent._id,
          role: [agentRole._id],
        };
        const assignClientObj = {
          agentId: agent._id,
          client: [req.body.clientId],
        };
        const assignServiceGroupObj = {
          agentId: agent._id,
          serviceGroup: [req.body.serviceGroupId],
        };
        const responseData1 = await agentFunctions.assignRoles(
          assignRoleObj,
          session
        );
        const responseData2 = await agentFunctions.assignClient(
          assignClientObj,
          session
        );
        const responseData3 = await agentFunctions.assignServiceGroup(
          assignServiceGroupObj,
          session
        );

        return res.send(
          Util.getOkRequest(agent, "Agent Created Successfully")
        );
      } else {
        return res.send(
          Util.getBadRequest(
            "Cannot Create Agent, No Client Found Against Given Client Id"
          )
        );
      }
    } else {
      return res.send(
        Util.getBadRequest(
          "Cannot Create Agent, No User (Client Admin) Found Against Given User Id"
        )
      );
    }
  } catch (error) {
    return res.send(Util.getBadRequest(error.message));
  } finally {
    session.endSession();
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getAllUserList,
  getUserById,
  updateUserById,
  deleteUserById,
  deleteStatusUserById,
  changeAccountStatusById,
  assignRoles,
  assignClient,
  changePassword,
  ListAgentsForClientAdmin,
  ListClientsForClientAdmin,
  createAgentByClientAdmin,
};
