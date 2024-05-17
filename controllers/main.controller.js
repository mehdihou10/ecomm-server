const createError = require('../utils/create.error');
const httpStatus = require('../utils/http.status');
const pool = require('../db');
const jwt = require('jsonwebtoken');


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


        res.json({status: httpStatus.SUCCESS,products})  

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
    getWishlist

}