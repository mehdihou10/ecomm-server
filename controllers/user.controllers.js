const pool = require("../db");
const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");
const generateToken = require("../utils/generate.token");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");

const verifyEmail = require("../utils/send.email");

const register = async (req, res, next) => {
  const { first_name, last_name, email, password, image, email_verification } =
    req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = createError(httpStatus.FAIL, 400, errors.array());
    return next(err);
  }
  const olderUser = await pool`select count(*) from users where email=${email}`;
  const oldUserVendor =
    await pool`select count(*) from vendor where email=${email}`;
  if (olderUser[0].count > 0) {
    const error = createError(httpStatus.FAIL, 400, [
      { msg: "user already registered" },
    ]);
    return next(error);
  }

  if (oldUserVendor[0].count > 0) {
    const error = createError(httpStatus.FAIL, 400, [
      { msg: "account already found" },
    ]);
    return next(error);
  }

  const hasedPassword = await bcrypt.hash(password, 10);

  if (email_verification) {
    const html = `
        <h4>Please copy this code:</h4>
        <code><h4 style='background-color: #eee; padding: 10px 20px;font-size: 20px; width: fit-content'>${email_verification}</h4></code>
        `;

    verifyEmail(html, email, "verification code");

    res.json({ status: httpStatus.SUCCESS });
  } else {
    try {
      await pool`insert into users (first_name,last_name,email,password,image) VALUES(${first_name},${last_name},${email},${hasedPassword},${image})`;
      const newUser = await pool`select * from users where email = ${email}`;
      const token = generateToken({
        type:"client" ,
        id: newUser[0].id,
        first_name,
        last_name,
        email,
        image,
      });
      res.json({ status: httpStatus.SUCCESS, token });
    } catch (error) {
      console.log("error", error);
      return next(error);
    }
  }
};

module.exports = {
  register,
};
