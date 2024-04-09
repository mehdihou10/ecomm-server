const {body} = require('express-validator');

module.exports = [
    
        body("name")
        .notEmpty().withMessage("add a product name")
        .isLength({min: 2, max: 50}).withMessage("add a valid name"),

        body("description")
        .notEmpty().withMessage("add a description")
        .isLength({min: 100,max: 200}).withMessage('add a valid description'),

        body("image")
        .notEmpty().withMessage("add a product image"),

        body("price")
        .notEmpty().withMessage("add a price")
        .isNumeric().withMessage('add a valid price'),

        body("category_id")
        .notEmpty().withMessage("add a category"),

        body("brand")
        .notEmpty().withMessage("add a product brand")
        .isLength({min: 2, max: 50}).withMessage("add a valid brand"),
    ]
