const express = require('express');

const router = express.Router();

const {decodeToken} = require('../controllers/decode.controller');

router.post("/",decodeToken);

module.exports = router;