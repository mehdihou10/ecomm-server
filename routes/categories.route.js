const express = require('express');

const router = express.Router();

const categoriesControllers = require('../controllers/categories.controllers');

router.get('/',categoriesControllers.getCategories);

module.exports = router;