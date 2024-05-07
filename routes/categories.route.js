const express = require("express");

const router = express.Router();

const categoriesControllers = require("../controllers/categories.controllers");

router.get("/", categoriesControllers.getCategories);
router.get("/:categoryId", categoriesControllers.getCategory);
router.get("/name/:categoryName/products",categoriesControllers.getProductsByCategory);
router.get("/id/:categoryId/products",categoriesControllers.getProductsById);


module.exports = router;
