const pool = require("../db");
const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");
const generateToken = require("../utils/generate.token");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");

const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password, image } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = createError(httpStatus.FAIL, 400, errors.array());
      return next(err);
    }
    const olderUser = await pool`select * from users where email=${email}`;
    if (olderUser.length > 0) {
      const error = createError(httpStatus.FAIL, 400, [
        { msg: "no such user" },
      ]);
      return next(error);
    }
    const hasedPassword = await bcrypt.hash(password, 10);
    await pool`insert into users (first_name,last_name,email,password,image) VALUES(${first_name},${last_name},${email},${hasedPassword},${image})`;
    const newUser = await pool`select * from users where email = ${email}`;
    const token = generateToken({
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
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = createError(httpStatus.FAIL, 400, errors.array());
      return next(err);
    }
    const user = await pool`select * from users where email=${email}`;
    if (user.length === 0) {
      const error = createError(httpStatus.FAIL, 400, [
        { msg: "no such user" },
      ]);
      return next(error);
    }
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      const error = createError(httpStatus.FAIL, 400, [{
        msg: "Incorrect password",
      }]);
      return next(error);
    }
    const token = generateToken({
      id: user[0].id,
      first_name: user[0].first_name,
      last_name: user[0].last_name,
      image: user[0].image,
      email: user[0].email,
    });
    res.json({ status: httpStatus.SUCCESS, token });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports = {
  register,
  login,
};
