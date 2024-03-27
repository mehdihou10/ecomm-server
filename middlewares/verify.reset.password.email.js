const {body} = require('express-validator');


module.exports = [

    body("email")
    .notEmpty().withMessage('Email required')
    .isEmail().withMessage('add a valid email')
]