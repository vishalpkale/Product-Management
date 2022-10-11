const express = require('express');
const router = express.Router();
const {createUser,getUserDetails,loginUser,updateProfile}= require("../controller/userController")


//--------------------------> (This is test api ) <-------------------------------------//
router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

router.post("/register",createUser)
router.get("/getuser/:userId",getUserDetails)
router.post("/loginUser",loginUser)
router.post('/user/:userId/profile',updateProfile)

module.exports = router;