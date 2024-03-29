const express = require('express');

const router = express.Router();

const vendorDashboardControllers = require('../controllers/vendor.dashboard.controllers');
const validationDashboard = require('../middlewares/verify.vendor.dashboard');

router.put("/:productId",validationDashboard,vendorDashboardControllers.updateProduct);
router.delete("/:productId",vendorDashboardControllers.deleteProduct);


module.exports = router;