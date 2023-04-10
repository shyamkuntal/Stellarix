const ErrorHander = require("../utils/errorhander")


module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    //wrong mongodb id error
    if(err.name === "CastError"){
        const message = `Resource not found, Invalid: ${err.path}`;
        err = new ErrorHander(message,400)
    }

    //mongoose duplicate key error
    if(err.code === 1100){
        const message = `Duplicate ${object.keys(err.keyValue)} Entered`;
        err = new ErrorHander(message, 400)
    }

    //wrong jwt error
    if(err.name === "jsonwebTokenError"){
        const message = `jsonwebToken is invalid, try again`;
        err = new ErrorHander(message, 400)
    }

    //jwt expire error
    if(err.name === "TokenExpiredError"){
        const message = `jsonwebToken is Expired, try again`;
        err = new ErrorHander(message, 400)
    }

    res.status(err.statusCode).json({
        success:false,
        message: err.message
    })
}
