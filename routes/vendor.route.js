const express = require('express');

const router = express.Router();
const verifyInput = require('../middlewares/verify.vendor.input');

//controllers
const {addVendor} = require('../controllers/vendor.controllers');

router.post('/register',verifyInput.register,addVendor)




module.exports = router;