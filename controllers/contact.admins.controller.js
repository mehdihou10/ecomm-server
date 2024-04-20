const pool = require("../db");
const jwt = require("jsonwebtoken");
const createError = require("../utils/create.error");
const httpStatus = require("../utils/http.status");
const { validationResult } = require("express-validator");
const { vendor } = require("../middlewares/verify.all.users.update");

const sendMessage = async (req, res, next) => {
  const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const userId = jwt.decode(token).id;
  const type = jwt.decode(token).type;

  const { message, date } = req.body;


  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = createError(httpStatus.FAIL, 400, errors.array());
    return next(error);
  }

  try {
    if (type === "client") {
      await pool`INSERT INTO "usersMessages" (user_id,message,date) VALUES (${userId},${message},${date})`;
    } else if (type === "vendor") {
      await pool`INSERT INTO "vendorsMessages" (vendor_id,message,date) VALUES (${userId},${message},${date})`;
    }

    res.json({ status: httpStatus.SUCCESS });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const vendorId = jwt.decode(token).id;
  try {
    const messages =
      await pool`select * from "vendorsMessages" where vendor_id = ${vendorId}`;
    return res.json({ status: httpStatus.SUCCESS, messages });
  } catch (error) {
    return next(error);
  }
};

module.exports = { sendMessage, getMessages };
