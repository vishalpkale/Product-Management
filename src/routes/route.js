const express = require('express');
const router = express.Router();
const authorController=require('../controller/authorController')
const blogsController=require('../controller/blogsController.js')
const middleware=require('../middleware/authorization')





module.exports = router;