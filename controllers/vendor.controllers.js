const pool = require('../db');

const bcrypt = require('bcryptjs');

const httpStatus = require('../utils/http.status');
const createError = require('../utils/create.error');

const {validationResult} = require('express-validator');

const generateToken = require('../utils/generate.token');

const verifyEmail = require('../utils/send.email');

//controllers

const addVendor = async(req,res,next)=>{

    const {first_name,last_name,email,password,image,phone_number,is_email_verification} = req.body;

    const errors = validationResult(req);

    if(!errors.isEmpty()){

        // return res.json({status: httpStatus.FAIL,message: errors.array()})
        const err = createError(httpStatus.FAIL,400,errors.array());

        return next(err);
    }

    const oldVendor = await pool`SELECT id FROM vendor WHERE email=${email}`;

    if(oldVendor.length !== 0){

        return res.json({status: httpStatus.FAIL, message: [{msg: "vendor already registered"}]})
    }

    const hashed_password = await bcrypt.hash(password,10);

    if(is_email_verification){

        verifyEmail('<h1>Hello world</h1>',email,"verification code");

        res.json({status: httpStatus.SUCCESS})

    } else{
        
        try{

        await pool`INSERT INTO vendor (first_name,last_name,email,password,image,phone_number) 
        VALUES (${first_name},${last_name},${email},${hashed_password},${image},${phone_number})`;

        const userRes = await pool`SELECT id FROM vendor WHERE email=${email}`;

        const token = generateToken({id: userRes[0].id,first_name,last_name,email,image,phone_number})

        res.json({status: httpStatus.SUCCESS, token})


    } catch(err){

        next(err);
    }

}


}

const loginVendor = async(req,res,next)=>{

    const {email,password} = req.body;

    const errors = validationResult(req);

    if(!errors.isEmpty()){

        const err = createError(httpStatus.FAIL,400,errors.array());

        return next(err);
    }

    const vendor = await pool`SELECT * FROM vendor WHERE email=${email}`;

    if(vendor.length === 0){

        const err = createError(httpStatus.FAIL,404,'vendor not found')

        return next(err);
    }

    const isPasswordTrue = await bcrypt.compare(password,vendor[0].password);

    if(!isPasswordTrue){

        const err = createError(httpStatus.FAIL,400,'incorrect password');

        return next(err);
    }

    const token = generateToken({id: vendor[0].id,first_name: vendor[0].first_name,last_name: vendor[0].last_name ,email: vendor[0].email,image: vendor[0].image,phone_number: vendor[0].phone_number})


    res.json({status: "success",token})
}


module.exports = {

    addVendor,
    loginVendor
}