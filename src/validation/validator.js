const mongoose = require('mongoose')

const isvalidBody = (value) => {
    return Object.keys(value).length > 0;
}

const isValidObjectId = (value) => {
    return mongoose.Types.ObjectId.isValid(value)
}


const stringRegex = (value) => {
    return /([a-zA-z])+/g.test(value);
};


const phoneRegex = (value) => {
    value=value.trim()
    return /^[\s]*[6-9]\d{9}[\s]*$/.test(value);
};


const emailRegex = (value) => {
    value=value.trim()
    return /^[a-z0-9_]{1,}@[a-z]{3,10}[.]{1}[a-z]{3}$/.test(value);
};


const pincodeRegex = (value) => {
    value=value.trim()
    return /^[1-9][0-9]{5}$/.test(value);
};


const passwordRegex = (value) => {
    value=value.trim()
    return /^[\s]*[0-9a-zA-Z@#$%^&*]{8,15}[\s]*$/.test(value);
};

const validImage=(value)=>{
    const imageTypes=['image/jpeg','image/jpg','image/png',]
if(!imageTypes.includes(value.mimetype)){ return false }
}

//-----------------------------product validation ---------------------------------//

const priceRegex = (value) => {
    return /^([1-9])+([0-9])*?$/.test(value)

};

const validSize=function(arrayOfSize){
    let size1 = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let size2 = arrayOfSize.toUpperCase().split(",").map((x) => x.trim())
            for (let i = 0; i < size2.length; i++) {
                if (!size1.includes(size2[i])) {
                    return false
                }
          }
     return true
 }
 

module.exports = { validImage,isValidObjectId, stringRegex, phoneRegex, emailRegex, pincodeRegex, passwordRegex, isvalidBody ,priceRegex,validSize}
