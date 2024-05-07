const pool = require('../db');
const httpStatus = require('../utils/http.status');

const getCategories = async (req,res,next)=>{

    try{

        const categories = await pool`SELECT * FROM category`;

        res.json({status: httpStatus.SUCCESS,categories})

    } catch(err){

        next(err);
    }
}

const getCategory = async (req,res,next)=>{
    const {categoryId} = req.params;

    try{
        const category = await pool `select name from category where id=${categoryId}`;
        res.json({status:httpStatus.SUCCESS,category})
    }catch(error){
        return next(error);
    }
}

const getProductsByCategory = async (req,res,next)=>{

    const {categoryName} = req.params;

    try{

        const products = await pool`SELECT P.*
                                    FROM product P,category C
                                    WHERE P.category_id=C.id AND C.name=${categoryName}`


        res.json({status: httpStatus.SUCCESS,products});                            

    } catch(err){
        next(err)
    }
}

const getProductsById = async (req,res,next)=>{

    const {categoryId} = req.params;
    const {productid} = req.headers;

    try{

        const products = await pool`SELECT P.*
                                    FROM product P,category C
                                    WHERE P.category_id=C.id AND C.id=${categoryId} AND P.id!=${productid}`;


        res.json({status: httpStatus.SUCCESS,products});                            

    } catch(err){
        next(err)
    }
}


module.exports = {getCategories,getCategory,getProductsByCategory,getProductsById}