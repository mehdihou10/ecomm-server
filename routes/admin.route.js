const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");
const validationScheme = require("../middlewares/verify.admin.input");


router.get("/accounts/vendor/pending", adminController.getPendingAccounts);
router.post("/accounts/vednor/:id", adminController.acceptVendor);
router.delete("/accounts/vednor/:id", adminController.deleteVendor);
router.get("/accounts/vendor/accepted", adminController.getAcceptedAccounts);
router.get("/accounts/clients", adminController.getClients);
router.delete("/accounts/clients/:id", adminController.deleteClient);
router.get("/accounts/clients/messages", adminController.getClientMessages);
router.get("/accounts/vendor/messages", adminController.getVendorMessages);
router.patch("/update/:id", validationScheme,adminController.updateAdmin);

module.exports = router;
