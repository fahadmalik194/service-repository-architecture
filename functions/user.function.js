const { User } = require("../models/user.model");
const { Client } = require("../models/client.model");
const { AllUsers } = require("../models/AllUsers.model");
const { GlobalSettings } = require("../models/globalSettings.model");
var crypto = require("crypto");

async function createAndSave(reqBody, session) {
  const hashedPassword = crypto
    .createHash("sha1")
    .update(reqBody.password)
    .digest("hex");

  await saveInAllUsers(
    {
      userName: reqBody.userName,
      email: reqBody.email,
      userType: "user"
    }
  )

  return await save(
    {
      name: reqBody.name,
      email: reqBody.email,
      phone_number: reqBody.phone_number,
      userName: reqBody.userName,
      password: hashedPassword,
      profile_picture: reqBody.profile_picture,
    },
    session
  );
}

async function save(userObj, session) {
  const user = new User(userObj);
  return await user.save({ session });
}

async function saveInAllUsers(userObj, session) {
  const allUsers = new AllUsers(userObj);
  return await allUsers.save({ session });
}

async function assignRoles(reqBody, session) {
  await User.findByIdAndUpdate(
    reqBody.userId, { $set: { role: [] } }, { new: true, useFindAndModify: false }
  );
  return User.findByIdAndUpdate(
    reqBody.userId, { $addToSet: { role: { "$each": reqBody.role } }, }, { new: true, useFindAndModify: false }
  )
}

async function assignClient(reqBody, session) {
  await User.findByIdAndUpdate(
    reqBody.userId, { $set: { client: [] } }, { new: true, useFindAndModify: false }
  );
  await User.findByIdAndUpdate(
    reqBody.userId, { $addToSet: { client: { "$each": reqBody.client } }, }, { new: true, useFindAndModify: false }
  );
  var serviceGroupIdArray = [];
  await Promise.all(reqBody.client.map(async (clientId, index) => {
    const filter = {
      _id: clientId
    }
    const clientData = await Client.findOne(filter)
      .populate({
        path: "serviceGroup",
        select: "-__v -enable -deleted -created_at -updated_at",
      })
      .sort({ name: 1 });
    if (!clientData) {
      return;
    }
    await Promise.all(clientData.serviceGroup.map(async (serviceGroup) => {
      serviceGroupIdArray.push(serviceGroup._id);
      console.log("ServiceGroupIDArray: ", serviceGroupIdArray);
    }));
  }));
  await User.findByIdAndUpdate(
    reqBody.userId, { $set: { serviceGroup: [] } }, { new: true, useFindAndModify: false }
  );
  const responseData = await User.findByIdAndUpdate(
    reqBody.userId, { $addToSet: { serviceGroup: { "$each": serviceGroupIdArray } }, }, { new: true, useFindAndModify: false }
  );

  return responseData;
}

async function checkUserRole(reqBody, session) {
  const userDetail = await User.findById({ _id: reqBody.userId, enable: true })
    .populate({
      path: "role",
      select: "-__v -enable -deleted -created_at -updated_at",
    })
    .populate({
      path: "client",
      select: "-__v -enable -deleted -created_at -updated_at",
    })
    .sort({ name: 1 });

  var globalsettings;

  if (userDetail) {
    await Promise.all(userDetail.role.map(async role => {
      if (role.roleName == reqBody.roleName) {
        globalsettings = await GlobalSettings.findOne()
          .where("key").equals(role.roleName)
      } else {
        globalsettings = '';
      }
    }));

    if (reqBody.roleName == globalsettings.key) {
      return userDetail;
    } else {
      return null;
    }
  } else {
    return null;
  }
}

module.exports = {
  createAndSave,
  assignRoles,
  assignClient,
  checkUserRole
};
