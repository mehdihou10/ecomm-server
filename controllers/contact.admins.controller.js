const pool = require("../db");
const jwt = require("jsonwebtoken");
const createError = require("../utils/create.error");
const httpStatus = require("../utils/http.status");
const { validationResult } = require("express-validator");
const sendEmail = require("../utils/send.email");

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

  async function sendMessageToAdmin(userData) {
    const html = `<p style='font-size: 14px; font-weight: bold; font-style: italic'>You received New Message from ${userData[0].first_name}_${userData[0].last_name}</p>
      <p>${message}</p>`;

    try {
      const adminsData = await pool`SELECT email FROM admin`;

      for (let admin of adminsData) {
        sendEmail(html, admin.email, "You received New Message");
      }
    } catch (err) {
      next(err);
    }
  }

  try {
    if (type === "client") {
      await pool`INSERT INTO "usersMessages" (user_id,message,date) VALUES (${userId},${message},${date})`;

      const clientData =
        await pool`SELECT first_name,last_name FROM users WHERE id=${userId}`;

      sendMessageToAdmin(clientData);
    } else if (type === "vendor") {
      await pool`INSERT INTO "vendorsMessages" (vendor_id,message,date) VALUES (${userId},${message},${date})`;

      const vendorData =
        await pool`SELECT first_name,last_name FROM vendor WHERE id=${userId}`;

      sendMessageToAdmin(vendorData);
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
