const { body } = require("express-validator");

module.exports = {
  client: [
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
  ],
  vendor: [
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

    body("phone_number")
      .notEmpty()
      .withMessage("Phone number is required")
      .isLength({ min: 8, max: 10 })
      .withMessage("Enter a valid phone number"),
  ],
};
