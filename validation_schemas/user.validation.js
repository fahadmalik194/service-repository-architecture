const Joi = require("joi");
const userValidationSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(40)
    .required()
    .error(() => {
      return {
        message: "user name is required.",
      };
    }),
  userName: Joi.string()
    .min(3)
    .max(40)
    .required()
    .error(() => {
      return {
        message: "username is required.",
      };
    }),
  email: Joi.string()
    .regex(/^([\w-\.]+@([\w-]+\.)+[\w-]{3,4})?$/)
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    })
    .error(() => {
      return {
        message:
          "email with correct format username@domain.com/.net is required.",
      };
    }),
  phone_number: Joi.string()
    // .regex(/^((\+92)|(0092))-{0,1}\d{3}-{0,1}\d{7}$|^\d{11}$|^\d{4}-\d{7}$/)
    .min(9)
    .max(20)
    .error(() => {
      return {
        message:
          "phone number with correct Pakistani format(+92-xxx-xxxxxxx) is required.",
      };
    }),
  password: Joi.string()
    .min(3)
    .max(255)
    .required()
    .error(() => {
      return {
        message: "password is required.",
      };
    }),
  profile_picture: Joi.string()
    .required()
    .error(() => {
      return {
        message: "InCorrect Profile Picture",
      };
    }),
});

exports.userValidationSchema = userValidationSchema;
