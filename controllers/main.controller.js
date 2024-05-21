const createError = require('../utils/create.error');
const httpStatus = require('../utils/http.status');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const sendEmail = require('../utils/send.email');



const getProducts = async (req,res,next)=>{
    
    try{

        const products = await pool`SELECT * FROM product GROUP BY id ORDER BY (orders+views) DESC LIMIT 20`;

        res.json({status: httpStatus.SUCCESS,products});

    } catch(err){
        next(err)
    }
}

const getProduct = async (req,res,next)=>{
    
    const {productName} = req.params;


    try{

        const products = await pool`SELECT * FROM product WHERE name=${productName}`;
        const commentData = await pool`SELECT AVG(rating),COUNT(*)
                                       FROM comments C,product P
                                       WHERE C.product_id=P.id AND P.name=${productName}`

        const comments = await pool`SELECT C.*,U.first_name,U.last_name,U.image
                                    FROM comments C,product P,users U
                                    WHERE C.product_id=P.id AND C.user_id=U.id AND P.name=${productName}`;


        const product = {...products[0],...commentData[0],comments};
        res.json({status: httpStatus.SUCCESS,product})
        
    } catch(err){
        next(err)
    }
}

const updateViews = async (req,res,next)=>{

    const {productId} = req.params;

    try{

        await pool`UPDATE product
                   SET views=views+1
                   WHERE id=${productId}`

        
        res.json({status: httpStatus.SUCCESS});
        
        
    } catch(err){
        next(err);
    }
}

const search = async (req,res,next)=>{

    const {text} = req.body;

    if(text.trim() === ""){

        const error = createError(httpStatus.ERROR,400,"Please add a text");
        return next(error);

    }

    try{
        
        const products = await pool`SELECT * FROM product WHERE
         POSITION(LOWER(${text}) IN LOWER(name)) > 0
         OR POSITION(LOWER(${text}) IN LOWER(brand)) > 0`;

         if(products.length === 0){

            const error = createError(httpStatus.FAIL,400,"no such product");
            return next(error)
         }
        
        
        res.json({status: httpStatus.SUCCESS,products})

    } catch(err){
        next(err)
    }
}

const addToCart = async (req,res,next)=>{

    const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }



  const userId = jwt.decode(token).id;

  const {productId} = req.params;
  const {qte} = req.body;

  try{

    const count = await pool`SELECT COUNT(*) FROM cart WHERE user_id=${userId} AND product_id=${productId}`;
    const product_qte = await pool`SELECT qte FROM product WHERE id=${productId}`;

    if(+count[0].count === 0){

        const productQte = +product_qte[0].qte;

        if(+qte <= productQte){

            await pool`INSERT INTO cart(user_id,product_id,qte) VALUES (${userId},${productId},${qte})`;
            res.json({status: httpStatus.SUCCESS})

        } else{

        res.json({status: httpStatus.FAIL,message: `${productQte === 0 ? 'This product is currently out of stock' : `Max Quantity is: ${productQte}`}`})
            
        }

    } else{

        res.json({status: httpStatus.FAIL,message: "Product Already In Cart"})
    }


  } catch(err){

    next(err);

  }

}

const getCart = async (req,res,next)=>{

    const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const userId = jwt.decode(token).id;

  const products = await pool`SELECT P.*,C.qte AS product_qte
                                    FROM cart C,product P
                                    WHERE C.product_id=P.id AND C.user_id=${userId}`;


   const prices = await pool`SELECT C.qte , P.price
                                    FROM cart C,product P
                                    WHERE C.product_id=P.id AND C.user_id=${userId}`; 
                                    
                                    
    const vendors = await pool`SELECT P.vendor_id
                                    FROM cart C,product P
                                    WHERE C.product_id=P.id AND C.user_id=${userId}
                                    GROUP BY P.vendor_id`;                                

        res.json({status: httpStatus.SUCCESS,products,prices,vendors: vendors.length})  

  try{

  } catch(err){
    next(err)
  }
}

const removeFromCart = async (req,res,next)=>{

    const headers = req.headers["Authorization"] || req.headers["authorization"];

  const token = headers.split(" ")[1];

  if (!token) {
    const error = createError(httpStatus.FAIL, 400, "token required");
    return next(error);
  }

  const userId = jwt.decode(token).id;

  const {productId} = req.params;

  try{

    await pool`DELETE FROM cart WHERE user_id=${userId} AND product_id=${productId}`;

    res.json({status: httpStatus.SUCCESS});

  } catch(err){
    next(err)
  }

}

const toggleWishlist = async (req,res,next)=>{

    const headers = req.headers["Authorization"] || req.headers["authorization"];

    const token = headers.split(" ")[1];
  
    if (!token) {
      const error = createError(httpStatus.FAIL, 400, "token required");
      return next(error);
    }
  
  
  
    const userId = jwt.decode(token).id;
  
    const {productId} = req.params;

    try{

        const count = await pool`SELECT COUNT(*) FROM wishlist WHERE user_id=${userId} AND product_id=${productId}`;

        if(+count[0].count === 0){

            await pool`INSERT INTO wishlist VALUES(${userId},${productId})`;
            res.json({status: httpStatus.SUCCESS})

        } else {

            await pool`DELETE FROM wishlist WHERE user_id=${userId} AND product_id=${productId}`;
            res.json({status: httpStatus.SUCCESS})

        }

    } catch(err){
        next(err)
    }


}

const isExistsInWishlist = async (req,res,next)=>{

    const headers = req.headers["Authorization"] || req.headers["authorization"];

    const token = headers.split(" ")[1];
  
    if (!token) {
      const error = createError(httpStatus.FAIL, 400, "token required");
      return next(error);
    }
  
  
  
    const userId = jwt.decode(token).id;
  
    const {productId} = req.params;

    try{

        const count = await pool`SELECT COUNT(*) FROM wishlist WHERE user_id=${userId} AND product_id=${productId}`;

        if(+count[0].count === 0){
            res.json({status: httpStatus.SUCCESS,isExists: false})
        } else{
            res.json({status: httpStatus.SUCCESS,isExists: true})

        }

    } catch(err){
        next(err)
    }
}

const getWishlist = async(req,res,next)=>{

    const headers = req.headers["Authorization"] || req.headers["authorization"];

    const token = headers.split(" ")[1];
  
    if (!token) {
      const error = createError(httpStatus.FAIL, 400, "token required");
      return next(error);
    }
  
  
  
    const userId = jwt.decode(token).id;

    try{

        const products = await pool`SELECT P.*
                                    FROM wishlist W,product P
                                    WHERE W.product_id=P.id AND W.user_id=${userId}`;


        res.json({status: httpStatus.SUCCESS,products})                            

    } catch(err){
        next(err)
    }
}

const verifyCoupon = async (req,res,next)=>{

    const {coupon} = req.body;
    

    if(coupon.trim() === ""){

        const error = createError(httpStatus.FAIL,400,"Please Add a Coupon");
        return next(error);
    }

    try{

        const count = await pool`SELECT COUNT(*) FROM coupons WHERE LOWER(coupon)=${coupon.toLowerCase()}`;

        if(+count[0].count === 0){

            const error = createError(httpStatus.FAIL,404,"Invalid Coupon")
            return next(error)

        }

        res.json({status: httpStatus.SUCCESS})

    } catch(err){
        next(err)
    }
}

const completeOrder = async (req,res,next)=>{

    const errors = validationResult(req);

    if(!errors.isEmpty()){

        const error = createError(httpStatus.FAIL,400,errors.array());
        return next(error);
    }

    const {qte,user_phone_number,user_city,user_id,product_id,total,date,address,user} = req.body;

    try{

        const count = await pool`SELECT COUNT(*) FROM "order" WHERE user_id=${user_id} AND product_id=${product_id}`;

        if(+count[0].count > 0){

            const error = createError(httpStatus.FAIL,400,[{msg: "Product already ordered"}])
            return next(error);
        }

        await pool`INSERT INTO "order" (qte,user_phone_number,user_city,user_id,product_id,total,date,address)
        VALUES (${qte},${user_phone_number},${user_city},${user_id},${product_id},${total},${date},${address})`;

        await pool`DELETE FROM cart WHERE user_id=${user_id}`;

        await pool`UPDATE product SET orders=orders+1 WHERE id=${product_id}`; 

        const vendorData = await pool`SELECT * 
                                      FROM product P,vendor V
                                      WHERE V.id=P.vendor_id AND P.id=${product_id}`;


        const productData = await pool`SELECT name FROM product WHERE id=${product_id}`;                              


        const html = `<div>

            <p>Hi <span style="font-weight: bold;">${vendorData[0].first_name}</span>,</p>
            <p>You recieved an order From <span>${user.first_name} ${user.last_name}</span></p>:
            <p><span style="font-weight: bold;">${qte} X ${productData[0].name}</span></p>
            <p>Full Address: ${address}</p>
            <p>Total: </p>
            <h3>${total} DZD</h3>


        </div>`

        sendEmail(html,vendorData[0].email,"You recived a new Order")                              


        res.json({status: "success"})

    } catch(err){
        next(err)
    }

}

const getCountData = async (req,res,next)=>{

    const headers = req.headers["Authorization"] || req.headers["authorization"];

    const token = headers.split(" ")[1];
  
    if (!token) {
      const error = createError(httpStatus.FAIL, 400, "token required");
      return next(error);
    }
  
  
  
    const userId = jwt.decode(token).id;

    try{

        const cart = await pool`SELECT COUNT(*) FROM cart WHERE user_id=${userId}`;
        const wishlist = await pool`SELECT COUNT(*) FROM wishlist WHERE user_id=${userId}`;

        res.json({status: httpStatus.SUCCESS,cart: cart[0].count,wishlist: wishlist[0].count});

    } catch(err){
        next(err);
    }
}

const getSimilarProducts = async (req,res,next)=>{

   const {productName} = req.params;

   try{

    const product = await pool`SELECT id,brand FROM product WHERE name=${productName}`;

    const brand = product[0].brand;
    const productId = product[0].id;


    const products = await pool`SELECT *
                                FROM product
                                WHERE id!=${productId} AND (
                                LOWER(brand)=LOWER(${brand}) OR 
                                POSITION(LOWER(${brand}) IN LOWER(brand)) > 0 OR
                                POSITION(LOWER(brand) IN LOWER(${brand})) > 0)
                                ORDER BY price ASC
                                `

    res.json({status: httpStatus.SUCCESS,products})

   } catch(err){
    next(err);
   }

}

module.exports = {

    getProducts,
    getProduct,
    updateViews,
    search,
    addToCart,
    getCart,
    removeFromCart,
    toggleWishlist,
    isExistsInWishlist,
    getWishlist,
    verifyCoupon,
    completeOrder,
    getCountData,
    getSimilarProducts
    

}