const Joi = require("joi");
const mongoose = require("mongoose");
const timeZone = require("mongoose-timezone");

const { userValidationSchema } = require("../validation_schemas/user.validation");

const userSchema = new mongoose.Schema(
  {
    profile_picture: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 255,
      trim: true,
      //match:/pattern/
    },
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      minlength: 10,
      maxlength: 60,
      required: true,
      required: "Email address is required",
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{3,4})?$/,
        "Please fill a valid email address",
      ],
    },
    phone_number: {
      type: String,
      trim: true,
      minlength: 9,
      maxlength: 15,
      required: true,
      required: "Phone number is required",
      // match: [
      //   /^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/,
      //   "Please fill a valid phone number",
      // ],
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      maxlength: 50,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    enable: {
      type: Boolean,
      default: true,
      minlength: 3,
      maxlength: 4,
    },
    deleted: {
      type: Boolean,
      default: false,
      minlength: 3,
      maxlength: 4,
    },
    role: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    }],
    client: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    }],
    serviceGroup: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ServiceGroup",
        required: true,
      },
    ],
  },
  { collation: { locale: "en_US", strength: 1 } }
);

function validateUser(client) {
  return Joi.validate(client, userValidationSchema);
}

userSchema.plugin(timeZone, { paths: ["created_at", "updated_at"] });

exports.User = mongoose.model("User", userSchema);
exports.validateUser = validateUser;
