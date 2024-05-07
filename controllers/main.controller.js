const createError = require('../utils/create.error');
const httpStatus = require('../utils/http.status');
const pool = require('../db');


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

module.exports = {

    getProducts,
    getProduct,
    updateViews

}