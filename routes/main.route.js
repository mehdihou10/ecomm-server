const express = require('express');

const router = express.Router();
const mainControoler = require('../controllers/main.controller');

router.get('/products',mainControoler.getProducts);
router.get("/products/:productName",mainControoler.getProduct);
router.patch('/products/:productId/add/view',mainControoler.updateViews);




module.exports = router;