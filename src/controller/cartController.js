const mongoose = require("mongoose")
const productModel = require("../model/productModel")
const cartModel = require("../model/cartModel")
const userModel = require("../model/userModel")

const { isValidObjectId } = require("../validation/validator")
const { findById } = require("../model/userModel")



const createCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) }
        const { cartId, productId } = req.body
        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }
        const checkProduct = await productModel.findById(productId)
        if (checkProduct == null || checkProduct.isDeleted == true) {
            return res.status(404).send({ status: false, message: "Product not found or it may be deleted" })
        }
        let itemForAdd =
        {
            "productId": productId,
            "quantity": 1
        }
        if (cartId) {
            if (!isValidObjectId(cartId)) { return res.status(400).send({ status: false, message: "Please provide a valid cartId." }) }
            const checkCard = await cartModel.findById(cartId)
            if (checkCard == null || checkCard.isDeleted == true) {
                return res.status(404).send({ status: false, message: "cart not found or it may be deleted" })
            }

            let arr = checkCard.items
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].productId == itemForAdd.productId) {
                    arr[i].quantity = arr[i].quantity + itemForAdd.quantity;
                    break
                }
                else if (i == (arr.length - 1)) {
                    arr.push(itemForAdd)
                    break
                }
            }
            const dataForCreate1 = {
                "userId": userId,
                "items": arr,
                "totalPrice": checkProduct.price + checkCard.totalPrice,
                "totalItems": arr.length///confuse in:when quantity of product is 2 at that time what should be totalItems
            }
            const updateCard = await cartModel.findByIdAndUpdate(
                { "_id": cartId },
                { $set: dataForCreate1 },
                { new: true }
            )
            return res.status(200).send({ status: true, message: "Cart Created", data: updateCard })///confuse about status code

        }
        else {
            const dataForCreate = {
                "userId": userId,
                "items": [itemForAdd],
                "totalPrice": checkProduct.price,
                "totalItems": 1
            }
            const createCart1 = await cartModel.create(dataForCreate)

            return res.status(201).send({ status: true, message: "Card Created", data: createCart1 })

        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const updateCart = async function (req, res) {
    try {
        const userId = req.params.userId
        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) }

        //const {productId ,cartId}

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

const getCart = async function (req, res) {
    try {

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}
//====================================DELETE API====================================================================//

const deleteCart = async (req, res) => {
    try {
        let userId = req.params.userId
        if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) };
       
        const userExist = await userModel.findById(userId)
        if(!userExist)return res.status(404).send({status:false,msg:"user not found"})
    
        const cartExist = await userModel.findById(userId)
        if(!cartExist)return res.status(404).send({status:false,msg:"cart not found"})
    
        let cart = await cartModel.findByIdAndUpdate((userId),{items:[],totalItems:0,totalPrice:0},{new:true})
        return res.status(204).send({ status: false, msg: "CART DELETED SUCESSFULLY", data:cart})
    } catch (error) {
        return res.status(500).send({status:false,err:error.message})
    }
}



module.exports = { createCart, updateCart, getCart, deleteCart }