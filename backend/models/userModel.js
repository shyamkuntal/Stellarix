const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4,"Name should have more than 4 characters"]
    },
    email:{
        type:String,
        required: [true, "Please Enter Your email"],
        unique:true,
        validate: [validator.isEmail, "Please Enter Valid email"],
    },
    password:{
        type:String,
        required: [true, "Please Enter Your Password"],
        minLength: [5,"Name should have more than 5 characters"],
        select:false
    },
    avatar:{
        public_id:{
            type:Number,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user"
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10)
    
})

// JWT TOKEN
userSchema.methods.getJWTToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRE,
    })
}

//compare Password
userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

// genreating password reset token
userSchema.methods.getResetPasswordToken = function(){
    //generating token
    const resetToken = crypto.randomBytes(20).toString("hex")
    //hashing and adding reserpasswordtoken to userschema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}

module.exports = mongoose.model("User", userSchema)