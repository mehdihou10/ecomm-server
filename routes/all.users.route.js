const express = require("express");

const router = express.Router();

const allUsersController = require("../controllers/all.users.controllers");

const validationScheme = require("../middlewares/verify.user.imput");
const validateEmail = require('../middlewares/verify.reset.password.email');
const validatePassword = require('../middlewares/verify.reset.password.input');

router.post("/login", validationScheme.login, allUsersController.login);
router.post("/send_email",allUsersController.sendPasswordInput);
router.post("/verify_email",validateEmail,allUsersController.verifyEmail);
router.post("/reset_password",validatePassword,allUsersController.resetPassword);

module.exports = router;
