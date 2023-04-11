const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");
 
//create product -- admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

    req.body.user = req.user.id

    const product = await Product.create(req.body);

    res.status(201).json({
        success:true,
        product
    })
})

// get single product by id

exports.getProductDetails = catchAsyncErrors(async(req,res,next) => {
    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHander("Product not found"))
    }
    
    res.status(200).json({
        success:true,
        product
    })
})


// get all product 
exports.getAllProducts = catchAsyncErrors(async (req, res) => {

    const resultPage = 5;
    const productCount = await Product.countDocuments();

    const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPage);

    // const products = await Product.find();
    const products = await apiFeature.query;
 
    res.status(200).json({
        success:true,
        productCount,
        products,
    });
})

//update product -- admin

exports.updateProduct = catchAsyncErrors(async (req, res, next) => {

    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHander("Product not found"))
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        product
    })
})

// delete Products -- admin

exports.deleteProduct = catchAsyncErrors(async (req,res,next) => {

    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHander("Product not found"))
    }

    product = await Product.findByIdAndDelete(req.params.id,req.body, {
        new: true,
    })

    res.status(200).json({
        success:true,
        message:"Product deleted Successfully"
    })
})

// create new review or update review
exports.createProductReview = catchAsyncErrors(async (req,res,next) => {

    const {rating, comment, productId } = req.body;

    const review = {
        user: req.user.id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }

    const product = await Product.findById(productId);
    const isReviewed  = product.reviews.find(rev => rev.user.toString()===req.user.id)
    if(isReviewed){
        product.reviews.forEach(rev => {
            if(rev => rev.user.toString())
        rev.rating = rating,
        rev.comment = comment
        });
    }else{
        product.reviews.push(review) 
        product.numOfReviews = product.reviews.length
    }

    let avg = 0;
    product.ratings = product.reviews.forEach(rev=>{
        avg += rev.rating
    })
    product.ratings = avg/product.reviews.length;

    await product.save({validateBeforeSave:false})

    res.status(200).json({
        success:true,
        
    })
})

//get All reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req,res,next) => {
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHander("Product not Found", 404))
    }

    res.status(200).json({
        success:true,
        reviews: product.reviews
        
    })
})

//Delete reviews of a product
exports.deleteReview = catchAsyncErrors(async (req,res,next) => {
    const product = await Product.findById(req.query.id);

    if(!product){
        return next(new ErrorHander("Product not Found", 404))
    }

    const reviews = product.reviews.filter(rev => rev.id.toString() !== req.query.id.toString())

    let avg = 0;
    reviews.forEach(rev=>{
        avg += rev.rating
    })
    const ratings = avg/reviews.length;
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        
    })
})