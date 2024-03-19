const pool = require('../db');

const getUsers = async(req,res,next)=>{

    // const result = await pool`SELECT * FROM ??`;

    res.json({status: "success"})

}

module.exports = {

    getUsers,
}