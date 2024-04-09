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


module.exports = {getCategories,getCategory}