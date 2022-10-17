const mongoose = require("mongoose")
const productModel = require("../model/productModel")
const orderModel = require("../model/orderModel")
const userModel = require("../model/userModel")
const { isValidObjectId } = require("../validation/validator")

const isValidstatus=(value)=>{
    const statuses=["pending", "completed", "cancled"]
    if(statuses.includes(value)) return true
    return false
}

const createOrder = async (req, res) => {
    try {
      let userId = req.params.userId;
  
      if (!isvalid(userId)) {
          return res.status(400).send({ status: false, message: "User ID is missing" });
      }
  
      if (!isValidObjectId(userId)) {
          return res.status(400).send({ status: false, message: "Please provide valid user Id" });
      }
  
      let data = req.body;
  
  
      if (!isvalidBody(data))
          return res.status(400).send({ status: false, message: "Body cannot be empty" });
  
      let { cartId, status, cancellable } = data;
  
      if (!cartId)
          return res.status(400).send({ status: false, message: "Cart ID is required" });
  
      // if (!isValidObjectId(cartId)) {
      //     return res.status(400).send({ status: false, message: "Cart ID is invaild" });
      // }
  
      if (!isValidObjectId(cartId)) {
          return res.status(400).send({ status: false, message: "Please provide valid cart Id" });
      }
  
      let findCart = await cartModel.findOne({ userId: userId });
  
      if (!findCart)
          return res.status(404).send({ status: false, message:" No such cart exist"});
  
      if (findCart.items.length === 0)
          return res.status(400).send({ status: false, message: "No Item in Cart" });
  
  
      if (status || typeof status == "string") {
          //checking if the status is valid
          if (!isvalid(status)) {
              return res.status(400).send({ status: false, message: " Please provide status" })
          }
          if (!isValidstatus(status))
              return res.status(400).send({ status: false, message: "Status should be one of 'pending', 'completed', 'cancelled'" });
      }
  
      if (cancellable || typeof cancellable == 'string') {
          if (!isvalid(cancellable))
              return res.status(400).send({ status: false, message: "cancellable should not contain white spaces" });
          if (typeof cancellable == 'string') {
              //converting it to lowercase and removing white spaces
              cancellable = cancellable.toLowerCase().trim();
              if (cancellable == 'true' || cancellable == 'false') {
                  //converting from string to boolean
                  cancellable = JSON.parse(cancellable)
              } else {
                  return res.status(400).send({ status: false, message: "Please enter either 'true' or 'false'" });
              }
          }
      }
  
      let totalQuantity = 0;
      for (let i = 0; i < findCart.items.length; i++)
          totalQuantity += findCart.items[i].quantity;
  
  
      data.userId = userId;
      data.items = findCart.items;
      data.totalPrice = findCart.totalPrice;
      data.totalItems = findCart.totalItems;
      data.totalQuantity = totalQuantity;
  
      let result = await orderModel.create(data);
      await cartModel.updateOne({ _id: findCart._id },
          { items: [], totalPrice: 0, totalItems: 0 });
  
      return res.status(201).send({ status: true, message: "Success", data: result })
  } catch (error) {
      return res.status(500).send({ status: false, error: error.message })
  }
  }






const updateOrder=async function(req,res){
    try{
        //-----------------------------user validation-----------------------------------------//
         const userId=req.params.userId
         if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) }
         const checkUser=await userModel.findById(userId)
         if (checkUser == null || checkUser.isDeleted == true) {
             return res.status(404).send({ status: false, message: "user not found or it may be deleted" })
         }
         //-----------------------------------------------------------------------------------------//
         const {orderId,status}=req.body

         if(!isValidstatus(status)){
            return res.status(400).send({status:false,message:" value of status can be one of  pending,completed or cancled"})
         }
         //----------------------------------------order validation---------------------------//
         if (!isValidObjectId(orderId)) { return res.status(400).send({ status: false, message: "Please provide a valid orderId." }) }
         const checkOrder=await userModel.findById(userId)
         if (checkOrder == null || checkOrder.isDeleted == true) {
             return res.status(404).send({ status: false, message: "user not found or it may be deleted" })
         }
         //-----------------------------------checking cancellable order or not ------------------------------------------------------//
         if(checkOrder.cancellable==false && status=='cancled'){
            return res.status(400).send({status:false,message:"This order cannot cancle because it is uncellable order"})
         }
        //---------------------------updating status--------------------------------------------------------------//
        
        const updateOrderStatus=await orderModel.findByIdAndUpdate(
            {_id:orderId},
            {$set:{"status":status}},
            {new:true}
        )

       return res.status(200).send({status:true,message:"updated",data:updateOrderStatus})
    }
    catch(err){
        return res.status(500).send({status:false,error:err.message})
    }
}








module.exports={ createOrder,updateOrder}