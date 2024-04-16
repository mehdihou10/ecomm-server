const {body} = require('express-validator');

module.exports = [
    
        body("name")
        .notEmpty().withMessage("add a product name")
        .isLength({min: 2, max: 50}).withMessage("add a valid name"),

        body("description")
        .notEmpty().withMessage("add a description")
        .isLength({min: 50,max: 100}).withMessage('add a valid description'),

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

        body('qte')
        .notEmpty().withMessage('Please specify product quantity')
        .isInt({ min: 1 }).withMessage('Please add a valid quantity')
        
    ]
