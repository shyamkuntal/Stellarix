const catchAsyncErrors = require("./catchAsyncErrors")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const ErrorHander = require("../utils/errorhander");




exports.isAuthenticatedUser = catchAsyncErrors(async(req,res,next) => {
    const {token} = req.cookies;
    if(!token){
        return next(new ErrorHander("Please Login to acess this resource",401))
    }

    const decodedData = jwt.verify(token,process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);
    next();
})


exports.authorizeRoles = (...roles) => {     // 2:47
    return (req,res,next) => {          
        if(!(roles.includes(req.user.role))){
            return next(new ErrorHander(`Role: ${req.res.role} is not allowed to acsess this resource`,403))
        }
        next();
    }
}