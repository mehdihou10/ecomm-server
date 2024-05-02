const express = require("express");

const router = express.Router();
const userController = require("../controllers/user.controllers.js");
const validationScheme = require("../middlewares/verify.user.imput.js");
const validateUpdate = require("../middlewares/verify.all.users.update.js");
const validateComment = require('../middlewares/verify.feedback.js');
//controllers

router.post("/register", validationScheme.register, userController.register);
router.put("/update/:userId",validateUpdate.client, userController.updateUser);
router.get("/:userId/:type",userController.getOrders);
router.patch('/order/:orderId/confirm',userController.confirmOrder);
router.post('/order/:orderId/feedback',validateComment,userController.addFeedback);
router.patch('/order/:orderId/feedback',validateComment,userController.updateFeedback);
router.get('/order/:orderId/feedback',userController.getFeedback);

module.exports = router;
