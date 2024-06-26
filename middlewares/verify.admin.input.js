const { body } = require("express-validator");

module.exports = [
  body("first_name")
    .notEmpty()
    .withMessage("add your first name")
    .isLength({ min: 3, max: 20 })
    .withMessage("add a valid first name"),

  body("last_name")
    .notEmpty()
    .withMessage("add your last name")
    .isLength({ min: 3, max: 20 })
    .withMessage("add a valid last name"),
];
