const {body} = require('express-validator');

module.exports = [

    body("message")
    .notEmpty().withMessage('Please Write Your Message')
]