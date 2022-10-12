const mongoose = require('mongoose')

const isvalid = (value) => {
    if (typeof value === "undefined" || typeof value === "null") return true;
    if (typeof value === "string" && value.trim().length === 0) return true;
    if (typeof value === "object" && Object.keys(value).length === 0) return true;
    return false;
}

const isvalidBody = (value) => {
    return Object.keys(value).length === 0;
}

const isValidObjectId = (value) => {
    return mongoose.Types.ObjectId.isValid(value)
}

const priceRegex = (value) => {
    return !(/^\d+(,\d{1,2})?$/).test(value)

};

const stringRegex = (value) => {
    return /^[a-zA-Z]{2,}(?: [a-zA-Z]+){0,2}$/.test(value);
};


const phoneRegex = (value) => {
    return /^[\s]*[6-9]\d{9}[\s]*$/.test(value);
};


const emailRegex = (value) => {
    return /^[a-z0-9_]{1,}@[a-z]{3,10}[.]{1}[a-z]{3}$/.test(value);
};


const pincodeRegex = (value) => {
    return /^[1-9][0-9]{5}$/.test(value);
};


const passwordRegex = (value) => {
    return /^[\s]*[0-9a-zA-Z@#$%^&*]{8,15}[\s]*$/.test(value);
};


module.exports = { isValidObjectId, stringRegex, phoneRegex, emailRegex, pincodeRegex, passwordRegex, isvalidBody, isvalid ,priceRegex}
