const pool = require("../db");
const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");
const generateToken = require("../utils/generate.token");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/send.email");
const url = require("../constants/client.url");

const { validationResult } = require("express-validator");
const jwt = require('jsonwebtoken');


const login = async (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = createError(httpStatus.FAIL, 400, errors.array());
    return next(err);
  }
  const users = await pool`select * from users`;
  const vendors = await pool`select * from vendor`;
  for (i = 0; i < users.length; i++) {
    const isValidPassword = await bcrypt.compare(password, users[i].password);
    if (users[i].email === email) {
      if (!isValidPassword) {
        const error = createError(httpStatus.FAIL, 400, [
          { msg: "incorrect password" },
        ]);
        return next(error);
      } else {
        const token = generateToken({
          id: users[i].id,
          first_name: users[i].first_name,
          last_name: users[i].last_name,
          image: users[i].image,
          email: users[i].email,
        });
        return res.json({ status: httpStatus.SUCCESS, token });
      }
    }
  }

  for (i = 0; i < vendors.length; i++) {
    const isValidPassword = await bcrypt.compare(password, vendors[i].password);
    if (vendors[i].email === email) {
      if (!isValidPassword) {
        const error = createError(httpStatus.FAIL, 400, [
          { msg: "incorrect password" },
        ]);
        return next(error);
      } else if (vendors[i].status === "pending") {
        const error = createError(httpStatus.FAIL, 400, [
          { msg: "Your account is pending" },
        ]);
        return next(error);
      } else {
        const token = generateToken({
          id: vendors[i].id,
          first_name: vendors[i].first_name,
          last_name: vendors[i].last_name,
          phone_number: vendors[i].phone_number,
          image: vendors[i].image,
          email: vendors[i].email,
        });
        return res.json({ status: httpStatus.SUCCESS, token });
      }
    }
  }

  const error = createError(httpStatus.FAIL, 400, [{ msg: "no such user" }]);
  return next(error);
};

const sendPasswordInput = async (req, res, next) => {
  const { email } = req.body;

  let type;
  let userObj;

  const clientRes = await pool`SELECT id,email FROM users WHERE email=${email}`;
  const vendorRes =
    await pool`SELECT id,email FROM vendor WHERE email=${email}`;

  if (clientRes.length > 0) {
    type = "client";
    userObj = clientRes[0];
  } else if (vendorRes.length > 0) {
    type = "vendor";
    userObj = vendorRes[0];
  } else {
    const error = createError(httpStatus.FAIL, 400, "email not found");
    return next(error);
  }

  
  const token = jwt.sign({ id: userObj.id, email: userObj.email, type },process.env.JWT_KEY,{expiresIn: "5min"})

  const html = `
  <p>Follow this link to reset your password for your ${email} account.</p>
  <a href=${url}/reset_password/${token}>${url}/reset_passwword/${token}</a>
  <p style='font-size: 14px; font-weight: bold; font-style: italic'>(this link will expire in 5 minutes)</p>
  `

  sendEmail(html,email,"reset password")
  res.json({status: httpStatus.SUCCESS});

};

const verifyEmail = (req,res,next)=>{

  const errors = validationResult(req);

  if(!errors.isEmpty()){

    const error = createError(httpStatus.FAIL,400,errors.array());
    return next(error);

  } else{

    return res.json({status: httpStatus.SUCCESS})
  }
}

const resetPassword = async (req,res,next)=>{

  const {id,email,type,new_password} = req.body;

  const errors = validationResult(req);

  if(!errors.isEmpty()){

    const err = createError(httpStatus.FAIL,400,errors.array());
    return next(err);
  }

  const hashed_password = await bcrypt.hash(new_password,10);


  try{


    if(type === "client"){

      await pool`UPDATE users 
              SET password=${hashed_password}
              WHERE id=${id} AND email=${email}`;

    } else if(type === "vendor"){

      await pool`UPDATE vendor
              SET password=${hashed_password}
              WHERE id=${id} AND email=${email}`;
    }

    res.json({status: httpStatus.SUCCESS})    
    
  } catch(err){

    next(err);
  }
    
}


module.exports = { login, sendPasswordInput,verifyEmail,resetPassword };
