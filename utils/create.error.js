module.exports = (status,code,message)=>{

    const error = new Error();

    error.status = status;
    error.code = code;
    error.message = message;
}