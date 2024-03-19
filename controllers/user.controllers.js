const pool = require("../db");
const httpStatus = require('../utils/http.status');
const createError = require("../utils/create.error")

const getUsers = async (req, res, next) => {
  try {
    const users = await pool`SELECT * FROM users`;
    res.status(200).json({ status: httpStatus.SUCCESS ,result:users});
  } catch (error) {

  }
};

module.exports = {
  getUsers,
};
