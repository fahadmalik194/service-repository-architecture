const mongoose = require("mongoose");

const customUserSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
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
    unique: true,
    minlength: 9,
    maxlength: 15,
    required: true,
    required: "Phone number is required",
    match: [
      /^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/,
      "Please fill a valid phone number",
    ],
  },
  password: {
    type: String,
    unique: true,
    required: true,
    minlength: 7,
    maxlength: 50,
    trim: true,
  },
});

exports.customUserSchema = customUserSchema;
