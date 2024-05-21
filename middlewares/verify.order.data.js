const {body} = require('express-validator');


module.exports = [
    body("user_city")
    .notEmpty().withMessage('Please Add a City'),

    body("user_phone_number")
    .isMobilePhone().withMessage("Please add a Phone number"),

    body("address")
    .notEmpty().withMessage("Please Add your Address")

]
