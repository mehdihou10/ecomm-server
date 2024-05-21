const pool = require("../db");
const httpStatus = require("../utils/http.status");
const createError = require("../utils/create.error");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const sendEmail = require('../utils/send.email');


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
    qte,
    date,
  } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = createError(httpStatus.FAIL, 400, errors.array());
    return next(err);
  }

  try {

    const productCount = await pool`SELECT COUNT(*) FROM product WHERE name=${name}`;

    if(+productCount[0].count > 0){

      const error = createError(httpStatus.FAIL,400,[{msg: "Product name Already used"}]);
      return next(error);

    }


    await pool`insert into product (name,description,category_id,vendor_id,image,price,brand,qte,date) values(${name},${description},${category_id},${vendor_id},${image},${price},${brand},${qte},${date})`;
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

  const { name, description, image, price, category_id,qte,brand } = req.body;

  try {

    const productCount = await pool`SELECT COUNT(*) FROM product WHERE name=${name} AND id!=${productId}`;

    if(+productCount[0].count > 0){

      const error = createError(httpStatus.FAIL,400,[{msg: "Product name Already used"}]);
      return next(error);

    }

    
    await pool`UPDATE product
                   SET name=${name},
                   description=${description},
                   image=${image},
                   price=${price},
                   category_id=${category_id},
                   brand=${brand},
                   qte=${qte}
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

  const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const vendorId = jwt.decode(token).id;


  try {
    const orders =
      await pool`select O.id, U.id as user_id,P.id as product_id,U.first_name,U.last_name,P.name,O.user_city,O.user_phone_number,O.qte,O.total,O.date,P.image
       from "order" O,product P ,users U,vendor V
        where O.product_id = P.id and V.id = P.vendor_id and U.id = O.user_id and P.vendor_id=${vendorId} `;
    return res.json({ status: httpStatus.SUCCESS, data: orders });
  } catch (error) {
    return next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  productId = req.params.id;
  userId = req.body.id;

  const date = new Date();

  try {
    const order =
      await pool`select * from "order" where user_id = ${userId} and product_id = ${productId}`;
    if (order.length === 0) {
      const error = createError(httpStatus.FAIL, 400, [
        { msg: "product not found" },
      ]);
      return next(error);
    }
    await pool`delete from "order" where product_id = ${productId} and user_id = ${userId} `;
    await pool`insert into "rejectedOrders" (user_id,product_id,date) VALUES(${userId},${productId},${date})`;

    const userData = await pool`SELECT * FROM users WHERE id=${userId}`;
    const vendorData = await pool`SELECT V.*,P.name FROM product P,vendor V WHERE P.vendor_id=V.id AND P.id=${productId}`;

    const html = `
    <div>
    Hi, <span style='font-weight: bold; font-style: italic'>${userData[0].first_name}</span>
    </div>

    <p>
    We emailed you to confirm that your order for: <span style='font-weight: bold; font-style: italic'>${vendorData[0].name}</span>
     has been rejected by
    <span style='font-weight: bold; font-style: italic'>${vendorData[0].first_name} ${vendorData[0].last_name}</span>
    </p>
    vendor's phone number:<a href="tel:${vendorData[0].phone_number}">${vendorData[0].phone_number}</a>
    `;

    sendEmail(html,userData[0].email,"Order Rejected!");


    return res.json({
      status: httpStatus.SUCCESS,
      message: "deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

const acceptOrder = async (req,res,next)=>{

  const {id,user_id,product_id,qte,date,city,total} = req.body;

  try{

    await pool`UPDATE product SET qte=qte-${qte} WHERE id=${product_id}`;

    await pool`INSERT INTO history (user_id,product_id,qte,date,city,total) VALUES(${user_id},${product_id},${qte},${date},${city},${total})`;
    await pool`DELETE FROM "order" WHERE id=${id}`;

    const userData = await pool`SELECT * FROM users WHERE id=${user_id}`;
    const vendorData = await pool`SELECT V.*,P.name FROM product P,vendor V WHERE P.vendor_id=V.id AND P.id=${product_id}`;

    const html = `
    <div>
    Hi, <span style='font-weight: bold; font-style: italic'>${userData[0].first_name}</span>
    </div>

    <p>
    We emailed you to confirm that your order for: <span style='font-weight: bold; font-style: italic'>${vendorData[0].name}</span>
     has been confirmed by
    <span style='font-weight: bold; font-style: italic'>${vendorData[0].first_name} ${vendorData[0].last_name}</span>
    </p>
    vendor's phone number:<a href="tel:${vendorData[0].phone_number}">${vendorData[0].phone_number}</a>
    `;

    sendEmail(html,userData[0].email,"Order Confirmed!");

    res.json({status: httpStatus.SUCCESS});

  } catch(err){
    next(err)
  }
}

const getHistory = async (req,res,next)=>{

   const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const vendorId = jwt.decode(token).id;


  try{

    const history = await pool`SELECT P.name,P.image,U.first_name,U.last_name,H.date,H.qte,H.city,H.total
                               FROM history H,product P,users U
                               WHERE H.product_id=P.id AND H.user_id=U.id AND P.vendor_id=${vendorId}`;

    res.json({status: httpStatus.SUCCESS,data: history})

  } catch(err){
    next(err);
  }
}

const getComments = async (req,res,next)=>{

  const {productId} = req.params;

  try{

    const comments = await pool`SELECT C.value,C.rating,U.first_name,U.last_name,U.image
                                FROM comments C,users U
                                WHERE C.user_id=U.id AND C.product_id=${productId}`;

     res.json({status: httpStatus.SUCCESS,comments});
     
     
  } catch(err){
    next(err)
  }
}

//main dashboard
const getStats = async (req,res,next)=>{
  
  const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const vendorId = jwt.decode(token).id;

  try{

    const productsData = await pool`SELECT COUNT(*) AS products,
                                   COALESCE(SUM(views), 0) AS views,
                                   COALESCE(SUM(orders), 0) AS orders
                                   FROM product
                                   WHERE vendor_id=${vendorId}`;


    const clientsData = await pool`SELECT COUNT(DISTINCT H.user_id) AS clients
                                   FROM history H,product P
                                   WHERE H.product_id=P.id AND P.vendor_id=${vendorId}`;   

                             
                                   
    const wilayasData = await pool`SELECT city,COUNT(city) AS city_orders
                                   FROM history H,product P
                                   WHERE H.product_id=P.id AND P.vendor_id=${vendorId}
                                   GROUP BY city
                                   ORDER BY COUNT(city) DESC
                                   LIMIT 10`;

    const wilayasCount = await pool`SELECT city,COUNT(city) AS city_orders
                                   FROM history H,product P
                                   WHERE H.product_id=P.id AND P.vendor_id=${vendorId}
                                   GROUP BY city
                                   ORDER BY COUNT(city) DESC`


    const ordersAcceptedData = await pool`SELECT COUNT(*) AS accepted_orders
                                           FROM history H,product P
                                           WHERE H.product_id=P.id AND P.vendor_id=${vendorId}`;
                                          
    const ordersrejectedData = await pool`SELECT COUNT(*) AS rejected_orders
                                           FROM "rejectedOrders" R,product P
                                           WHERE R.product_id=P.id AND P.vendor_id=${vendorId}`;    
                                           
    
    
    
    const fullData = {
      productsData: productsData[0],
      clientsData: clientsData[0].clients,
      wilayasData,
      wilayasCount: Object.keys({...wilayasCount}).length,
      accepted_orders: ordersAcceptedData[0].accepted_orders,
      rejected_orders: ordersrejectedData[0].rejected_orders,
      ordersPercentage: Math.ceil(
        (+ordersAcceptedData[0].accepted_orders
          /(+ordersAcceptedData[0].accepted_orders+ +ordersrejectedData[0].rejected_orders)
        )
         * 100) || 0

    };  
                                        
                                           
    res.json({status: httpStatus.SUCCESS,data: fullData})

  } catch(err){
    next(err)
  }
}

const getCoupons = async(req,res,next)=>{

  const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const vendorId = jwt.decode(token).id;

  try{

    const coupons = await pool`SELECT id,coupon FROM coupons WHERE vendor_id=${vendorId}`;

    res.json({status: httpStatus.SUCCESS,coupons});

  } catch(err){
    next(err)
  }
}

const addCoupon = async(req,res,next)=>{
  
  const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const vendorId = jwt.decode(token).id;

  const errors = validationResult(req);

  if(!errors.isEmpty()){

    const error = createError(httpStatus.FAIL,400,errors.array());
    return next(error);

  }

  const {coupon} = req.body;


  try{

    await pool`INSERT INTO coupons (vendor_id,coupon) VALUES (${vendorId},${coupon})`;

    res.json({status: httpStatus.SUCCESS})

  } catch(err){
    next(err)
  }
}

const deleteCoupon = async(req,res,next)=>{

  const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const vendorId = jwt.decode(token).id;

  const {couponId} = req.params;

  try{

    await pool`DELETE FROM coupons WHERE id=${couponId} AND vendor_id=${vendorId}`;

    res.json({status: httpStatus.SUCCESS})

  } catch(err){
    next(err)
  }
}


module.exports = {
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  addProduct,
  getOrders,
  deleteOrder,
  acceptOrder,
  getHistory,
  getComments,
  getStats,
  getCoupons,
  addCoupon,
  deleteCoupon
};
