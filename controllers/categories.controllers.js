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


module.exports = {getCategories}