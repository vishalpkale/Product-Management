const express = require('express');
const router = express.Router();
const {createUser,getUserDetails,loginUser,updateProfile}= require("../controller/userController")
const{authentication,authorization}=require("../middleware/auth")
const{createProduct,productByid,updateProduct,getallProduct,deleteProduct}= require("../controller/productController")
const{createCard,updateCard,getCard,deleteCard}=require("../controller/cartController")
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

router.post('/users/:userId/cart',createCard)
router.put('/users/:userId/cart',updateCard) 
router.get('/users/:userId/cart',getCard)
router.delete('/users/:userId/cart',deleteCard)


router.post('/users/:userId/orders',createOrder)
router.put('/users/:userId/orders',updateOrder)


module.exports = router;