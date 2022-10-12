const express = require('express');
const router = express.Router();
const {createUser,getUserDetails,loginUser,updateProfile}= require("../controller/userController")
const{authentication,authorization}=require("../middleware/auth")


//--------------------------> (This is test api ) <-------------------------------------//
router.get("/test-me", async function (req, res) {
    
        const salt = await bcrypt.genSalt(13);
        const password = await bcrypt.hash(req.body.password, salt);
        console.log(password)
    res.send("My first ever api!")
})

router.post("/register",createUser)
router.get("/user/:userId/profile",authentication,authorization,getUserDetails)
router.post("/login",loginUser)
router.put('/user/:userId/profile',authentication,authorization,updateProfile)

module.exports = router;