const {body} = require('express-validator');


module.exports = [
    body("coupon")
    .notEmpty().withMessage('You must add a Coupon')
    .isLength({min: 3, max: 20}).withMessage("Please Add a Valid Coupon")
]