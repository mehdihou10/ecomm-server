const jwt = require('jsonwebtoken');
const createError = require('../utils/create.error');
const httpStatus = require('../utils/http.status');


const decodeToken = async (req,res,next)=>{

    const header = req.headers['Authorization'] || req.headers['authorization'];


    if(!header){

        const error = createError(httpStatus.FAIL,401,"not authorized");
        return next(error);
    }

    const token = header.split(' ')[1];

    if(!token){

        const error = createError(httpStatus.FAIL,401,"token required");
        return next(error);
    }

    try{
        const decodedToken = jwt.verify(token,process.env.JWT_KEY);
    
        res.json({status: httpStatus.SUCCESS, user: decodedToken})

    } catch(err){

        return next(err);
    }
}

module.exports = {decodeToken}