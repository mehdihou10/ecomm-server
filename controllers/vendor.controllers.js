const pool = require('../db');

const getVendors = async(req,res,next)=>{

    // const result = await pool`SELECT * FROM ??`;
    res.json({status: "success"})


}


module.exports = {

    getVendors
}