const mongoose=require('mongoose')

const isValidObjectId=function(value){
   return mongoose.Types.ObjectId.isValid(value)
}


const stringRegex = function (value) {
    return /^[a-zA-Z]{2,}(?: [a-zA-Z]+){0,2}$/.test(value);
};


const phoneRegex = function (value) {
    return /^[\s]*[6-9]\d{9}[\s]*$/.test(value);
};


const emailRegex = function (value) {
    return /^[a-z0-9_]{1,}@[a-z]{3,10}[.]{1}[a-z]{3}$/.test(value);
};


const pincodeRegex = function (value) {
    return /^[1-9][0-9]{5}$/.test(value);
};


const passwordRegex = function (value) {
    return /^[\s]*[0-9a-zA-Z@#$%^&*]{8,15}[\s]*$/.test(value);
};


module.exports={isValidObjectId,stringRegex,phoneRegex,emailRegex,pincodeRegex,passwordRegex}
