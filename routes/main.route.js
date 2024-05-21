const express = require('express');

const router = express.Router();
const mainController = require('../controllers/main.controller');
const verifyOrderData = require('../middlewares/verify.order.data');


router.get('/products',mainController.getProducts);
router.get("/products/:productName",mainController.getProduct);
router.get("/similar/products/:productName",mainController.getSimilarProducts);
router.patch('/products/:productId/add/view',mainController.updateViews);
router.post("/search",mainController.search);
router.post("/cart/add/:productId",mainController.addToCart);
router.get("/cart/products",mainController.getCart);
router.delete("/cart/products/:productId",mainController.removeFromCart);
router.post("/wishlist/toggle/:productId",mainController.toggleWishlist);
router.get("/wishlist/verify/:productId",mainController.isExistsInWishlist);
router.get("/wishlist/products",mainController.getWishlist);
router.post("/coupon/verify",mainController.verifyCoupon);
router.post("/order/complete",verifyOrderData,mainController.completeOrder);
router.get("/count",mainController.getCountData);


module.exports = router;