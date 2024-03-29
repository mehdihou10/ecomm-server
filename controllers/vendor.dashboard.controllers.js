const pool = require("../db");
const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");
const { validationResult } = require("express-validator");

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

module.exports = { updateProduct, deleteProduct, getProducts, addProduct };
