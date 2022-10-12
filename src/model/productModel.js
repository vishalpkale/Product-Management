const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    currencyId: {
        type: String,
        required: true,
        default: "INR"
    },
    currencyFormat: {
        type: String,
        required: true,
        default: "₹"
    },//ctrl+alt+4
    isFreeShipping: { type: boolean, default: false },
    productImage: {
        type: String,
        required: true
    },  // s3 link
    style: { type: String },
    availableSizes: {
        type: [string],
        enum: ["S", "XS", "M", "X", "L", "XXL", "XL"]
    },
    installments: { type: Number },
    deletedAt: {
        type: Date,
        default: undefined
    },
    isDeleted: { type: boolean, default: false }
}, { timestamp: true }
)

module.exports = mongoose.model("Product", productSchema)
