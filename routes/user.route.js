const express = require('express');

const router = express.Router();

//controllers
const {getUsers} = require('../controllers/user.controllers');

router.get('/',getUsers);

module.exports = router;