const pool = require("../db");
const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");
const generateToken = require("../utils/generate.token");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");

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
      }else{

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
      } else {
        const token = generateToken({
          id: vendors[i].id,
          first_name: vendors[i].first_name,
          last_name: vendors[i].last_name,
          phone_number: vendors[i].phone_number,
          image: vendors[i].image,
          email: vendors[i].email,
        });
      }
      return res.json({ status: httpStatus.SUCCESS, token });
    }
  }
  const error = createError(httpStatus.FAIL, 400, [{ msg: "no such user" }]);
  return next(error);
};

module.exports = { login };
