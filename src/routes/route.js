const express = require('express');
const router = express.Router();
const {createUser}= require("../controller/userController")

//--------------------------> (This is test api ) <-------------------------------------//
router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
})

router.post("/register",createUser)




module.exports = router;