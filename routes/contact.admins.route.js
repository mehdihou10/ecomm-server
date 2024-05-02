const express = require("express");

const router = express.Router();

const contactController = require("../controllers/contact.admins.controller");
const messageValidation = require("../middlewares/verify.contact.message");

//routes
router.post("/", messageValidation, contactController.sendMessage);
router.get("/messages", contactController.getMessages);

module.exports = router;
