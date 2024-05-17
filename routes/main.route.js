const express = require('express');

const router = express.Router();
const mainController = require('../controllers/main.controller');

router.get('/products',mainController.getProducts);
router.get("/products/:productName",mainController.getProduct);
router.patch('/products/:productId/add/view',mainController.updateViews);
router.post("/search",mainController.search);
router.post("/cart/add/:productId",mainController.addToCart);
router.get("/cart/products",mainController.getCart);
router.delete("/cart/products/:productId",mainController.removeFromCart);
router.post("/wishlist/toggle/:productId",mainController.toggleWishlist);
router.get("/wishlist/verify/:productId",mainController.isExistsInWishlist);
router.get("/wishlist/products",mainController.getWishlist);



module.exports = router;