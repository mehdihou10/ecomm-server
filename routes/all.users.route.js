const express = require("express");

const router = express.Router();

const allUsersController = require("../controllers/all.users.controllers");

const validationScheme = require("../middlewares/verify.user.imput");

router.post("/login", validationScheme.login, allUsersController.login);

module.exports = router;
