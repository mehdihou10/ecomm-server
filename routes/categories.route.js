const express = require("express");

const router = express.Router();

const categoriesControllers = require("../controllers/categories.controllers");

router.get("/", categoriesControllers.getCategories);

router.get("/:categoryId", categoriesControllers.getCategory);

module.exports = router;
