const express = require("express");

const router = express.Router();
const userController = require("../controllers/user.controllers.js");
const validationScheme = require("../middlewares/verify.user.imput.js");
//controllers

router.post("/register", validationScheme, userController.register);
router.post("/login",  userController.login);

module.exports = router;
