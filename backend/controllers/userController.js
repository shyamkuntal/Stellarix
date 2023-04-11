const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail.js")
const crypto = require("crypto")


exports.registerUser = catchAsyncErrors( async(req,res,next) => {

    const {name,email,password} = req.body;

    const user = await User.create({
        name,email,password,
        avatar:{
            public_id:798798 ,
            url:"profilepic"
        }
    })
    sendToken(user,201,res)
    
})

//Login User
exports.loginUser = catchAsyncErrors( async (req,res,next) => {
    const{email,password} = req.body;
    //checkking if user has given password and email both
    if(!email || !password){
        return next(new ErrorHander("Please Enter Email & Password",400))
    }

    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHander("Invalid Email or Password",401))
    }

    const isPasswordMatched = await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHander("Invalid Email or Password",401))
    }

    sendToken(user,200,res)

})

//logout user

exports.logout = catchAsyncErrors(async(req,res,next) => {

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success:true,
        message:"Logged Out"
    })
})

// forgot password

exports.forgotPassword = catchAsyncErrors(async(req,res,next) => {

    const user = await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHander("User not found",404))
    }
    // get resetpassword token
    const resetToken = user.getResetPasswordToken();               //shyd error

    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${req.protocal}://${req.get("host")}/api/v1/password/reset/${resetToken}`;

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then, please ignore it `;

    try {
        await sendEmail({
            email: user.email,
            subject: `Stellarix Password Recovery`,
            message
        });
        res.status(200).json({
            success:true,
            message: `Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({validateBeforeSave: false});
        return next(new ErrorHander(error.message, 500))

    }
})

// reset password

exports.resetPassword =  catchAsyncErrors(async(req,res,next) => {
    
    //creating token hash
    const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        reserPasswordExpire:{$gt: Date.now()},
    })
    if(!user){
        return next(new ErrorHander("Reset Password Toekn is invalid or has been expired",400))
    }
    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHander("Password does not Match",400))
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    sendToken(user,200,res)
})

//get User details
exports.getUserDetails =  catchAsyncErrors(async(req,res,next) => {

    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user,
    })

})

//update user password
exports.updatePassword =  catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
    if(!isPasswordMatched){
        return next(new ErrorHander("Old Password is incorrect",400))
    }
    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHander("Password does not match",400))
    }
    user.password = req.body.newPassword;
    await user.save();
    sendToken(user,200,res)

})

//update user profile
exports.updateProfile =  catchAsyncErrors(async(req,res,next) => {
   
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    res.status(200).json({
        success:true,
    })

})

//get all users
exports.getAllUser =  catchAsyncErrors(async(req,res,next) => {

    const users = await User.find();

    res.status(200).json({
        success:true,
        users
    })

})

//get single details -- admin
exports.getSingleUser =  catchAsyncErrors(async(req,res,next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHander(`user does not exist with Id: ${req.params.id}`))
    }
    res.status(200).json({
        success:true,
        user
    })

})

//update user role -- admin
exports.updateUserRole =  catchAsyncErrors(async(req,res,next) => {
   
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    if(!user){
        return next(new ErrorHander(`user does not exist with Id: ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
    })

})

//delete user profile -- admin
exports.deleteUser =  catchAsyncErrors(async(req,res,next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHander(`user does not exist with Id: ${req.params.id}`))
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success:true,
        message:"User deleted successfully"
    })

})