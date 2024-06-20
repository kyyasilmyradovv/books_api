const { validate } = require('uuid');
const validator = require('validator');
const AppError = require('../error/appError');

// Required fields for each table creation(post)
let requiredFields = {
  book: ['title', 'author'],
  user: ['username', 'email', 'password'],
};

// Common Functions
let parentFunctions = {
  isString: function (value) {
    return typeof value === 'string';
  },
  isNumber: function (value) {
    return typeof value === 'number';
  },
  isInteger: function (value) {
    return Number.isInteger(value);
  },
  isFloat: function (value) {
    return typeof value === 'number' && !Number.isInteger(value);
  },
  isObject: function (value) {
    return typeof value === 'object';
  },
  isBoolean: function (value) {
    return typeof value === 'boolean' || ['true', 'false'].includes(value);
  },
  isDate: function (value) {
    return Date.parse(value);
  },
  isTime: function (value) {
    return (
      typeof value === 'string' && new RegExp('([01]?[0-9]|2[0-3]):[0-5][0-9]')
    );
  },
  isEmail: function (value) {
    return validator.isEmail(value);
  },
  isUuid: function (value) {
    return validate(value);
  },
  isArrayOfIntegers: function (value) {
    return Array.isArray(value) && value.every((e) => Number.isInteger(e));
  },
  isArrayOfStrings: function (value) {
    return Array.isArray(value) && value.every((e) => typeof e === 'string');
  },
};

// Validators for all fields of all models
let typeCheckers = {
  // String
  title: parentFunctions.isString,
  author: parentFunctions.isString,
  username: parentFunctions.isString,
  password: parentFunctions.isString,
  // Number
  order: parentFunctions.isNumber,
  // Date
  publicationDate: parentFunctions.isDate,
  // Email
  email: parentFunctions.isEmail,
  // Array of strings
  genres: parentFunctions.isArrayOfStrings,
};

exports.checkInputs = (model, action) => {
  return (req, res, next) => {
    let requiredFields_ = requiredFields[model];
    let requestBody = req.body;
    let requestKeys = Object.keys(requestBody);

    // Return error if all required fields are not provided, works for only create(post) requests
    if (
      action === 'create' &&
      !requiredFields_.every((e) => e in requestBody)
    ) {
      let notProvidedFields = requiredFields_.filter(
        (e) => !Object.keys(requestBody).includes(e)
      );
      return next(
        new AppError(
          `Invalid Credentials. Not provided fields: ${notProvidedFields.join(
            ', '
          )}`,
          400
        )
      );
    }

    // Return error if even one field is provided with invalid variable type or required field has null as value
    for (key of requestKeys) {
      if (
        !typeCheckers[key] ||
        (requestBody[key] === null && requiredFields_.includes(key)) ||
        (requestBody[key] !== null && !typeCheckers[key](requestBody[key]))
      ) {
        return next(new AppError(`Invalid credentials: ${key}`, 400));
      }
    }

    return next();
  };
};
