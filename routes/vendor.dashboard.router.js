const express = require("express");

const router = express.Router();

const validationDashboard = require("../middlewares/verify.vendor.dashboard");
const vendorDashboardControllers = require("../controllers/vendor.dashboard.controllers");


//products
router.get("/:id", validationDashboard, vendorDashboardControllers.getProducts);
router.get('/product/:productId',vendorDashboardControllers.getProduct);
router.post("/add", validationDashboard, vendorDashboardControllers.addProduct);
router.put(
  "/:productId",
  validationDashboard,
  vendorDashboardControllers.updateProduct
);
router.delete("/:productId", vendorDashboardControllers.deleteProduct);

//orders
router.get("/orders/show",vendorDashboardControllers.getOrders)
router.delete("/orders/show/:id",vendorDashboardControllers.deleteOrder)
router.post("/orders/accept",vendorDashboardControllers.acceptOrder);

//history
router.get("/history/show",vendorDashboardControllers.getHistory)

//comments
router.get("/:productId/comments",vendorDashboardControllers.getComments);

module.exports = router;