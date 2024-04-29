const pool = require("../db");

const httpStatus = require("../utils/http.status");

const generateToken = require("../utils/generate.token");

const createError = require("../utils/create.error");
const sendEmail = require("../utils/send.email");
const { validationResult } = require("express-validator");

const getPendingAccounts = async (req, res, next) => {
  const headers = req.headers["Authorization"] || req.headers["authorization"];
  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token is required");
    return next(error);
  }

  try {
    const vendorsAccounts =
      await pool`select * from vendor where status = 'pending' `;
    if (vendorsAccounts.length === 0) {
      return res.json({ status: httpStatus.FAIL, data: "no such accounts" });
    }

    return res.json({ status: httpStatus.SUCCESS, vendorsAccounts });
  } catch (error) {
    return next(error);
  }
};

const acceptVendor = async (req, res, next) => {
  const id = req.params.id;
  try {
    const vendor = await pool`select * from vendor where id = ${id}`;
    if (vendor.length === 0) {
      return res.json({ status: httpStatus.FAIL, data: "no such vednor" });
    }
    await pool`update vendor set status = 'accepted' where id = ${id} `;
    const html = `
        Hi <span style='font-weight: bold; font-style: italic'>${vendor[0].first_name}</span>,
        <p>You are has been accepted by the admin</p>
        `;
    sendEmail(html, vendor[0].email, "your acount is accepted");
    return res.json({ status: httpStatus.SUCCESS });
  } catch (error) {
    return next(error);
  }
};

const deleteVendor = async (req, res, next) => {
  const id = req.params.id;
  try {
    const vendor = await pool`select * from vendor where id = ${id}`;
    if (vendor.length === 0) {
      return res.json({ status: httpStatus.FAIL, data: "no such vednor" });
    }

    await pool`delete from vendor where id = ${id}`;
    const html = `
        Hi <span style='font-weight: bold; font-style: italic'>${vendor[0].first_name}</span>,
        <p>You are has been deleted by the admin</p>
        `;
    sendEmail(html, vendor[0].email, "your acount is deleted");

    return res.json({ status: httpStatus.SUCCESS });
  } catch (error) {
    return next(error);
  }
};

const getAcceptedAccounts = async (req, res, next) => {
  const headers = req.headers["Authorization"] || req.headers["authorization"];
  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token is required");
    return next(error);
  }

  try {
    const acceptedAccounts =
      await pool` select * from vendor where status = 'accepted' `;
    if (acceptedAccounts.length === 0) {
      return res.json({
        status: httpStatus.FAIL,
        data: "no such accepted vednor",
      });
    }
    return res.json({ status: httpStatus.SUCCESS, acceptedAccounts });
  } catch (error) {
    return next(error);
  }
};

const getClients = async (req, res, next) => {
  const headers = req.headers["Authorization"] || req.headers["authorization"];
  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token is required");
    return next(error);
  }
  try {
    const clients = await pool`select * from users`;
    if (clients.length === 0) {
      return res.json({
        status: httpStatus.FAIL,
        data: "no such client",
      });
    }

    return res.json({ status: httpStatus.SUCCESS, clients });
  } catch (error) {
    return next(error);
  }
};

const deleteClient = async (req, res, next) => {
  const id = req.params.id;
  try {
    const client = await pool`select * from users where id = ${id}`;
    if (client.length === 0) {
      return res.json({
        status: httpStatus.FAIL,
        data: "no such client",
      });
    }
    await pool`delete from users where id = ${id}`;

    const html = `
    Hi <span style='font-weight: bold; font-style: italic'>${client[0].first_name}</span>,
    <p>You are has been deleted by the admin</p>
    `;
    sendEmail(html, client[0].email, "your acount is deleted");
    return res.json({ status: httpStatus.SUCCESS });
  } catch (error) {
    return next(error);
  }
};

const getClientMessages = async (req, res, next) => {
  try {
    const messages =
      await pool`select first_name,last_name,email,message,date from "usersMessages" UM,users U where UM.user_id = U.id`;
    if (messages.length === 0) {
      return res.json({ status: httpStatus.FAIL, data: "no such messgaes" });
    }
    return res.json({ status: httpStatus.SUCCESS, messages });
  } catch (error) {
    return next(error);
  }
};

const getVendorMessages = async (req, res, next) => {
  try {
    const messages =
      await pool`select first_name,last_name,email,message,date from "vendorsMessages" VM,vendor V where VM.vendor_id = V.id`;
    if (messages.length === 0) {
      return res.json({ status: httpStatus.FAIL, data: "no such messgaes" });
    }
    return res.json({ status: httpStatus.SUCCESS, messages });
  } catch (error) {
    return next(error);
  }
};

const updateAdmin = async (req, res, next) => {
  const id = req.params.id;
  const { first_name, last_name, email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = createError(httpStatus.FAIL, 400, errors.array());
    return next(err);
  }
  try {
    const admin = await pool`select * from admin where id = ${id}`;
    if (admin.length === 0) {
      const error = createError(httpStatus.FAIL, 400, "no such admin");
      return next(error);
    }
    await pool`update admin set first_name = ${first_name},last_name=${last_name},email=${email} where id = ${id}`;
    const token = generateToken({
      type: "admin",
      id,
      first_name,
      last_name,
      email,
    });

    return res.json({ status: httpStatus.SUCCESS, token });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  deleteVendor,
  getPendingAccounts,
  acceptVendor,
  getAcceptedAccounts,
  getClients,
  deleteClient,
  getClientMessages,
  getVendorMessages,
  updateAdmin,
};