const express = require('express');

const router = express.Router();
const verifyInput = require('../middlewares/verify.vendor.input');
const validateUpdate = require("../middlewares/verify.all.users.update.js");

//controllers
const {addVendor,updateVendor} = require('../controllers/vendor.controllers');

router.post('/register',verifyInput.register,addVendor);
router.put("/update/:userId",validateUpdate.vendor, updateVendor);




module.exports = router;