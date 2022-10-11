const express = require('express');
const route = require('./routes/route.js');
const mongoose  = require('mongoose');
const multer = require("multer")
const app = express();

app.use(multer().any())

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


mongoose.connect("mongodb+srv://vishalkale:vishalpkale@cluster0.ofyxk.mongodb.net/group34Database", {
    useNewUrlParser: true
})
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )

app.use('/', route);


app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
})