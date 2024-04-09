const express = require("express");

const router = express.Router();

const validationDashboard = require("../middlewares/verify.vendor.dashboard");
const vendorDashboardControllers = require("../controllers/vendor.dashboard.controllers");

router.get("/:id", validationDashboard, vendorDashboardControllers.getProducts);
router.get('/product/:productId',vendorDashboardControllers.getProduct);
router.post("/add", validationDashboard, vendorDashboardControllers.addProduct);
router.put(
  "/:productId",
  validationDashboard,
  vendorDashboardControllers.updateProduct
);
router.delete("/:productId", vendorDashboardControllers.deleteProduct);
module.exports = router;
