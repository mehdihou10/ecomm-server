const {body} = require('express-validator');

module.exports = [
    body('value')
    .notEmpty().withMessage('Please Add a Comment')
    .isLength({min: 2}).withMessage('Please Add a Valid Comment')
]