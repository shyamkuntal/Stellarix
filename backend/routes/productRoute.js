const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteReview } = require("../controllers/productController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();


router.route("/products").get(getAllProducts);

router.route("/products/:id").get(getProductDetails)

router.route("/product/admin/new").post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

router.route("/product/admin/:id")
.put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
.delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

router.route("/review").put(isAuthenticatedUser, createProductReview);
 
router.route("/reviews")
.get(getProductReviews)
.delete(isAuthenticatedUser, deleteReview);
 
module.exports = router;