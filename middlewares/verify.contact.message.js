const {body} = require('express-validator');

module.exports = [

    body("message")
    .notEmpty().withMessage('Please Write Your Message')
    .isLength({min:20}).withMessage("Please write a valid message")
]