const pool = require("../db");
const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");
// const validationScheme = require("../middlewares/verify.vendor.dash.input");

const getProducts = async (req, res, next) => {
  const vendorId = req.params.id;
  try {
    const prodcuts =
      await pool`select * from product where vendor_id=${vendorId}`;
    if (prodcuts.length === 0) {
      return res.json({ status: httpStatus.SUCCESS, data: "no such products" });
    }
    return res.json({ status: httpStatus.SUCCESS, data: prodcuts });
  } catch (error) {
    return next(error);
  }
};

const addProduct = async (req, res, next) => {
  const { name, description, vendor_id, category_id, image, price, brand } =
    req.body;
  //   const errors = validationScheme(req);
  //   if (!errors.isEmpty()) {
  //     const err = createError(httpStatus.FAIL, 400, errors.array());
  //     return next(err);
  //   }

  try {
    await pool`insert into product (name,description,category_id,vendor_id,image,price,brand) values(${name},${description},${category_id},${vendor_id},${image},${price},${brand})`;
    res.json({ status: httpStatus.SUCCESS });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getProducts,
  addProduct,
};
