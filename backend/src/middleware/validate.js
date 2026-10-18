const Joi = require("joi");

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false,
    allowUnknown: false,
  });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ error: "Validation failed", messages });
  }
  next();
};

exports.validate = validate;

exports.schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .allow("", null)
      .optional(),
    password: Joi.string().min(6).required(),
    role: Joi.string()
      .valid("student", "teacher", "parent")
      .default("student"),
    class: Joi.number().min(1).max(10).optional(),
    language: Joi.string().valid("en", "mr", "hi").default("en"),
    teacherCode: Joi.string().optional().allow("", null),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().trim().length(6).required(),
  }),
  resendOtp: Joi.object({
    email: Joi.string().email().required(),
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().trim().length(6).required(),
    newPassword: Joi.string().min(6).required(),
  }),
};
