const pool = require("../db");
const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { validationResult } = require("express-validator");

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, password, image } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ status: httpStatus.FAIL,message: errors.array() });
    }
    const olderUser = await pool`select * from users where email=${email}`;
    if (olderUser.length > 0) {
      // const error = createError(httpStatus.FAIL, 400, "user already exists");
      return res.status(500).json({ error: "user already exists" });
      // return res.json({error});
      // return next(error);
    }
    const hasedPassword = await bcrypt.hash(password, 10);
    await pool`insert into users (first_name,last_name,email,password,image) VALUES(${first_name},${last_name},${email},${hasedPassword},${image})`;
    const token = jwt.sign({ email }, process.env.JWT_KEY, {
      expiresIn: "3h",
    });
    res.status(200).json({ token });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool`select * from users where email=${email}`;
    if (user.length === 0) {
      return res.status(404).json({ error: "no such user" });
    }
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(404).json({ error: "password incorrect" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

module.exports = {
  register,
  login,
};
