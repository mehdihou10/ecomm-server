const express = require('express');

const router = express.Router();
const verifyInput = require('../middlewares/verify.vendor.input');

//controllers
const {addVendor, loginVendor} = require('../controllers/vendor.controllers');

router.post('/register',verifyInput.register,addVendor)
router.post('/login',verifyInput.login,loginVendor)




module.exports = router;