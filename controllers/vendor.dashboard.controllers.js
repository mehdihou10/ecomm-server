const pool = require("../db");
const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

const getProducts = async (req, res, next) => {
  const vendorId = req.params.id;
  try {
    const prodcuts = await pool`SELECT P.*,C.name AS cat_name
                 FROM product P,category C
                 WHERE P.category_id=C.id
                 AND P.vendor_id=${vendorId}`;
    return res.json({ status: httpStatus.SUCCESS, data: prodcuts });
  } catch (error) {
    return next(error);
  }
};

const getProduct = async (req, res, next) => {
  const { productId } = req.params;

  const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const vendorId = jwt.decode(token).id;

  try {
    const products =
      await pool`SELECT * FROM product WHERE id=${productId} AND vendor_id=${vendorId}`;

    if (products.length === 0) {
      const error = createError(httpStatus.FAIL, 400, "product not found");
      return next(error);
    }
    res.json({ status: httpStatus.SUCCESS, product: products[0] });
  } catch (err) {
    next(err);
  }
};

const addProduct = async (req, res, next) => {
  const {
    name,
    description,
    vendor_id,
    category_id,
    image,
    price,
    brand,
    date,
  } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = createError(httpStatus.FAIL, 400, errors.array());
    return next(err);
  }

  try {
    await pool`insert into product (name,description,category_id,vendor_id,image,price,brand,date) values(${name},${description},${category_id},${vendor_id},${image},${price},${brand},${date})`;
    res.json({ status: httpStatus.SUCCESS });
  } catch (error) {
    return next(error);
  }
};

const updateProduct = async (req, res, next) => {
  const { productId } = req.params;

  const ids = await pool`SELECT id FROM product`;

  let isProductExists = false;

  for (const obj of ids) {
    if (+obj.id === +productId) {
      isProductExists = true;
      break;
    }
  }

  if (!isProductExists) {
    const error = createError(httpStatus.FAIL, 400, [
      { msg: "product not found" },
    ]);
    return next(error);
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = createError(httpStatus.FAIL, 400, errors.array());
    return next(error);
  }

  const { name, description, image, price, category_id, brand } = req.body;

  try {
    await pool`UPDATE product
                   SET name=${name},
                   description=${description},
                   image=${image},
                   price=${price},
                   category_id=${category_id},
                   brand=${brand}
                   WHERE id=${productId}`;

    res.json({ status: httpStatus.SUCCESS });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  const { productId } = req.params;

  const ids = await pool`SELECT id FROM product`;

  let isProductExists = false;

  for (const obj of ids) {
    if (+obj.id === +productId) {
      isProductExists = true;
      break;
    }
  }

  if (!isProductExists) {
    const error = createError(httpStatus.FAIL, 400, [
      { msg: "product not found" },
    ]);
    return next(error);
  }

  try {
    await pool`DELETE FROM product WHERE id=${productId}`;

    res.json({ status: "success" });
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders =
      await pool`select U.first_name,U.last_name,P.name,qte from "order" O,product P ,users U,vendor V where O.product_id = P.id and V.id = P.vendor_id and U.id = O.user_id `;
    return res.json({ status: httpStatus.SUCCESS, data: orders });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  addProduct,
  getOrders,
};
