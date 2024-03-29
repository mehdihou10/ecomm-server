const express = require("express");

const router = express.Router();

const vendorDashboardControllers = require('../controllers/vendor.dashboard.controllers');

router.get("/:id", vendorDashboardControllers.getProducts);
router.post("/add", vendorDashboardControllers.addProduct);

module.exports = router;
