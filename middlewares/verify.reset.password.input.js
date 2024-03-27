const {body} = require('express-validator');

module.exports = [

    body("new_password")
    .notEmpty().withMessage('add a new password')
    .isStrongPassword().withMessage('add a strong password')
]