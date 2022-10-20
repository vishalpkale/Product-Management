const orderModel = require("../model/orderModel")
const userModel = require("../model/userModel")
const cartModel=require('../model/cartModel')
const { isValidObjectId ,isvalidBody} = require("../validation/validator")

const isValidstatus=(value)=>{
    const statuses=["pending", "completed", "cancled"]
    if(statuses.includes(value)) return true
    return false
}

const createOrder = async (req, res) => {
    try {
      let userId = req.params.userId;
      if (!userId || !isValidObjectId(userId)) {
          return res.status(400).send({ status: false, message: "Please provide valid user Id" });
      }
  
      if (!isvalidBody(req.body))
          return res.status(400).send({ status: false, message: "provide data to make order" });
  
      let { cartId, status, cancellable } = req.body;
  
      if (!cartId || !isValidObjectId(cartId))
          return res.status(400).send({ status: false, message: "cartId is required and should be valid" });
  
      let findCart = await cartModel.findOne({ userId: userId });
  
      if (!findCart)
          return res.status(404).send({ status: false, message:"No cart found with this cartId"});
  
      if (findCart.items.length === 0)
          return res.status(400).send({ status: false, message: "No Item present in Cart" });
  
  const orderData={}
      if (status) {
          if ((status != "pending")  && (status!="completed"))
              return res.status(400).send({ status: false, message: "status should be either 'pending' or 'completed'" });
              orderData["status"]=status
        }
  
      if (cancellable) {
              cancellable = cancellable.toLowerCase().trim();
              let arr =[true,false,"true","false"]
              if (!arr.includes(cancellable)) {
                return res.status(400).send({ status: false, message: "Please enter either 'true' or 'false'" });
              }
              orderData["cancellable"]=cancellable
      }
  
      let totalQuantity = 0;
      for (let i = 0; i < findCart.items.length; i++){
          totalQuantity = totalQuantity+findCart.items[i].quantity;
      }
  
  
  orderData["userId"] = userId;
  orderData["items"] = findCart.items;
  orderData["totalPrice"] = findCart.totalPrice;
  orderData["totalItems"] = findCart.totalItems;
  orderData["totalQuantity"] = totalQuantity;
  
  
      let result = await orderModel.create(orderData);
      await cartModel.updateOne(
         { "_id": findCart._id },
         {$set: { items: [], totalPrice: 0, totalItems: 0 }}
         );
  
      return res.status(201).send({ status: true, message: "Success", data: result })
  } catch (error) {
      return res.status(500).send({ status: false, error: error.message })
  }
  }






const updateOrder=async function(req,res){
    try{
        //-----------------------------user validation-----------------------------------------//
         const userId=req.params.userId
         if (!userId || !isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) }
         const checkUser=await userModel.findById(userId)
         if (checkUser == null || checkUser.isDeleted == true) {
             return res.status(404).send({ status: false, message: "user not found or it may be deleted" })
         }
         //-----------------------------------------------------------------------------------------//
         const {orderId,status}=req.body

         if(!status || !isValidstatus(status)){
            return res.status(400).send({status:false,message:"Provide value for status one of these pending,completed or cancled"})
         }
         //----------------------------------------order validation---------------------------//
         if (!orderId || !isValidObjectId(orderId)) { return res.status(400).send({ status: false, message: "Please provide a valid orderId." }) }
         const checkOrder=await orderModel.findById(orderId)
         if (checkOrder == null || checkOrder.isDeleted == true) {
             return res.status(404).send({ status: false, message: "order not found or it may be deleted" })
         }
         //-----------------------------------checking cancellable order or not ------------------------------------------------------//
         if(checkOrder.cancellable==false && (status=='cancled' ) ){
            return res.status(400).send({status:false,message:"This order cannot cancel because it is uncancellable order"})
         }

         if(checkOrder.status=="completed" && (status=='cancled' ) ){
            return res.status(400).send({status:false,message:"This order cannot cancel because it already completed"})
         }
        //---------------------------updating status--------------------------------------------------------------//
        
        const updateOrderStatus=await orderModel.findByIdAndUpdate(
            {_id:orderId},
            {$set:{"status":status}},
            {new:true}
        )

       return res.status(200).send({status:true,message:"Success",data:updateOrderStatus})
    }
    catch(err){
        return res.status(500).send({status:false,error:err.message})
    }
}








module.exports={ createOrder,updateOrder}