const express = require('express');
const router = express.Router();
const {createUser,getUserDetails,loginUser,updateProfile}= require("../controller/userController")


//--------------------------> (This is test api ) <-------------------------------------//
router.get("/test-me", async function (req, res) {
    
        const salt = await bcrypt.genSalt(13);
        const password = await bcrypt.hash(req.body.password, salt);
        console.log(password)
    res.send("My first ever api!")
})

router.post("/register",createUser)
router.get("/getuser/:userId",getUserDetails)
router.post("/loginUser",loginUser)
router.post('/user/:userId/profile',updateProfile)

module.exports = router;