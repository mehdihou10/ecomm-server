const pool = require("../db");

const bcrypt = require("bcryptjs");

const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");

const { validationResult } = require("express-validator");

const generateToken = require("../utils/generate.token");

const sendEmail = require("../utils/send.email");

//controllers

const addVendor = async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    password,
    image,
    phone_number,
    city,
    email_verification,
  } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // return res.json({status: httpStatus.FAIL,message: errors.array()})
    const err = createError(httpStatus.FAIL, 400, errors.array());

    return next(err);
  }

  const oldVendor = await pool`SELECT id FROM vendor WHERE email=${email}`;

  if (oldVendor.length !== 0) {
    return res.json({
      status: httpStatus.FAIL,
      message: [{ msg: "vendor already registered" }],
    });
  }

  const oldUser = await pool`SELECT COUNT(*) FROM users WHERE email=${email}`;

  if (oldUser[0].count > 0) {
    return res.json({
      status: httpStatus.FAIL,
      message: [{ msg: "account already found" }],
    });
  }

  const hashed_password = await bcrypt.hash(password, 10);

  if (email_verification) {
    const html = `
        <h4>Please copy this code:</h4>
        <code><h4 style='background-color: #eee; padding: 10px 20px;font-size: 20px; width: fit-content'>${email_verification}</h4></code>
        `;

    sendEmail(html, email, "verification code");

    res.json({ status: httpStatus.SUCCESS });
  } else {
    try {
      await pool`INSERT INTO vendor (first_name,last_name,email,password,image,phone_number,city) 
        VALUES (${first_name},${last_name},${email},${hashed_password},${image},${phone_number},${city})`;

      const userRes = await pool`SELECT id FROM vendor WHERE email=${email}`;

      const token = generateToken({
        id: userRes[0].id,
        first_name,
        last_name,
        email,
        image,
        phone_number,
        city,
        type: "vendor",
      });

      const html = `
      Hi <span style='font-weight: bold; font-style: italic'>${first_name}</span>,
      <p>You are successfully registered,your must wait now for admin confirmation</p>
      `;

      sendEmail(html,email,"Your Account is Pending")

      res.json({ status: httpStatus.SUCCESS, token });
    } catch (err) {
      next(err);
    }
  }
};

const updateVendor = async (req, res, next) => {
  const { userId } = req.params;
  const { first_name, last_name, email, phone_number,city, image } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = createError(httpStatus.FAIL, 400, errors.array());
    return next(err);
  }

  try{
    await pool`UPDATE vendor
                 SET first_name=${first_name},
                 last_name=${last_name},
                 image=${image},
                 phone_number=${phone_number},
                 city=${city}
                 WHERE id=${userId} `;

     const token = generateToken({
    type: "vendor",
    id: userId,
    first_name,
    last_name,
    phone_number,
    city,
    image,
    email,
  });        
  
  res.json({ status: httpStatus.SUCCESS, token });

  } catch(err){
    return next(err);
  }
 
};

module.exports = {
  updateVendor,
  addVendor,
};
