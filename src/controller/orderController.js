// const mongoose = require("mongoose")
// const productModel = require("../model/productModel")
// const orderModel = require("../model/orderModel")
// const userModel = require("../model/userModel")
// const { isValidObjectId } = require("../validation/validator")

// const isValidstatus=(value)=>{
//     const statuses=["pending", "completed", "cancled"]
//     if(statuses.includes(value)) return true
//     return false
// }








// const updateOrder=async function(req,res){
//     try{
//         //-----------------------------user validation-----------------------------------------//
//          const userId=req.params.userId
//          if (!isValidObjectId(userId)) { return res.status(400).send({ status: false, message: "Please provide a valid userId." }) }
//          const checkUser=await userModel.findById(userId)
//          if (checkUser == null || checkUser.isDeleted == true) {
//              return res.status(404).send({ status: false, message: "user not found or it may be deleted" })
//          }
//          //-----------------------------------------------------------------------------------------//
//          const {orderId,status}=req.body

//          if(!isValidstatus(status)){
//             return res.status(400).send({status:false,message:" value of status can be one of  pending,completed or cancled"})
//          }
//          //----------------------------------------order validation---------------------------//
//          if (!isValidObjectId(orderId)) { return res.status(400).send({ status: false, message: "Please provide a valid orderId." }) }
//          const checkOrder=await userModel.findById(userId)
//          if (checkOrder == null || checkOrder.isDeleted == true) {
//              return res.status(404).send({ status: false, message: "user not found or it may be deleted" })
//          }
//          //-----------------------------------checking cancellable order or not ------------------------------------------------------//
//          if(checkOrder.cancellable==false && status=='cancled'){
//             return res.status(400).send({status:false,message:"This order cannot cancle because it is uncellable order"})
//          }
//         //---------------------------updating status--------------------------------------------------------------//
        
//         const updateOrderStatus=await orderModel.findByIdAndUpdate(
//             {_id:orderId},
//             {$set:{"status":status}},
//             {new:true}
//         )

//        return res.status(200).send({status:true,message:"updated",data:updateOrderStatus})
//     }
//     catch(err){
//         return res.status(500).send({status:false,error:err.message})
//     }
// }








// module.exports={ createOrder,updateOrder}