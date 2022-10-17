const express = require('express');
const router = express.Router();
const {createUser,getUserDetails,loginUser,updateProfile}= require("../controller/userController")
const{authentication,authorization}=require("../middleware/auth")
const{createProduct,productByid,updateProduct,getallProduct,deleteProduct}= require("../controller/productController")
const{getCart, createCart, updateCart, deleteCart}=require("../controller/cartController")
const{ createOrder,updateOrder}=require('../controller/orderController')

//--------------------------> (This is test api ) <-------------------------------------//
router.get("/test-me", async function (req, res) {
    res.send("My first ever api!")
})

router.post("/register",createUser)
router.get("/user/:userId/profile",authentication,authorization,getUserDetails)
router.post("/login",loginUser)
router.put('/user/:userId/profile',authentication,authorization,updateProfile)


router.post('/products',createProduct)
router.get('/products',getallProduct)
router.get('/products/:productId',productByid)
router.put('/products/:productId',updateProduct)
router.delete('/products/:productId',deleteProduct)

router.post('/users/:userId/cart',createCart)
router.put('/users/:userId/cart',authentication,authorization,updateCart) 
router.get('/users/:userId/cart',getCart)
router.delete('/users/:userId/cart',authentication,authorization,deleteCart)


// router.post('/users/:userId/orders',createOrder)
// router.put('/users/:userId/orders',updateOrder)


module.exports = router;