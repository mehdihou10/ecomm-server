const express = require('express');

const router = express.Router();


//controllers
const {getVendors} = require('../controllers/vendor.controllers');

router.get('/',getVendors);




module.exports = router;