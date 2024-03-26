const express = require("express");

const router = express.Router();

const allUsersController = require("../controllers/all.users.controllers");

const validationScheme = require("../middlewares/verify.user.imput");

router.post("/login", validationScheme.login, allUsersController.login);
router.post("/reset_password",allUsersController.resetPassword)

module.exports = router;
