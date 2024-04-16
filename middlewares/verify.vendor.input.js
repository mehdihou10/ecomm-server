const {body} = require('express-validator');

module.exports = {

    register: [

        body('first_name')
        .notEmpty().withMessage('add your first name')
        .isLength({min: 3, max: 20}).withMessage('add a valid first name'),
    
        body('last_name')
        .notEmpty().withMessage('add your last name')
        .isLength({min: 3, max: 20}).withMessage('add a valid last name'),
    
        body('email')
        .notEmpty().withMessage('add a your email')
        .isEmail().withMessage('add a valid Email Syntax'),
    
        body("password")
        .notEmpty().withMessage('add your password')
        .isStrongPassword().withMessage('add stronger password'),
    
        body('phone_number')
        .notEmpty().withMessage('please add your phone number')
        .isMobilePhone().withMessage('please add a valid phone number'),

        body("city")
        .notEmpty().withMessage('Please add your city')
    
        
    ],

    login: [

        body('email')
        .notEmpty().withMessage('add a your email')
        .isEmail().withMessage('add a valid Email Syntax'),
    
        body("password")
        .notEmpty().withMessage('add your password')

    ]
}