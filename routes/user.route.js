const express = require("express");

const router = express.Router();
const userController = require("../controllers/user.controllers.js");
const validationScheme = require("../middlewares/verify.user.imput.js");
const validateUpdate = require("../middlewares/verify.all.users.update.js");
//controllers

router.post("/register", validationScheme.register, userController.register);
router.put("/update/:userId",validateUpdate.client, userController.updateUser);


module.exports = router;
