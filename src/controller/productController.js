const productModel = require("../model/productModel")
const {uploadFile}=require("../aws/aws");

const {isValidObjectId,isvalid,priceRegex,validSize}=require("../validation/validator")

const createProduct = async (req,res)=>{
try{
    if (Object.keys(req.body).length == 0) {
        return res.status(400).send({status: false,message: "for registration user data is required",});}
        let {title,description,price,currencyId,isFreeShipping,style,availableSizes,installments}=req.body

        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            productImage = uploadedFileURL;
        } else {
            return res.status(400).send({ message: "No file found" });
        } 
        if (!productImage) {return res.status(400).send({ status: false, message: "please provide productImage" }); }
        
        if(!isvalid(title))return res.status(400).send({ status: false, message: "please provide tittle and it should be in string" })

        if(!isvalid(description))return res.status(400).send({ status: false, message: "please provide description it should be in string" })
        
        if(!price ||!priceRegex(price))return res.status(400).send({ status: false, message: "please provide price only in numbers" })

        if(currencyId !="INR")return res.status(400).send({ status: false, message: "Only indian currency id allowed for example INR" })

        if(!isvalid(style))return res.status(400).send({ status: false, message: "please provide style only in string" })

        if(!validSize(availableSizes))return res.status(400).send({ status: false, message: "The size can be only S, XS,M, X, L, XXL" })

        if(!priceRegex(installments))return res.status(400).send({ status: false, message: "please provide installments only in numbers" })
//-----------checking duplication------//
        let uniquetitile = await productModel.findOne({title:title})
        if(uniquetitile)return res.status(400).send({ status: false, message:"this tittle is already available"})

        const data ={title:title,description:description,price:price,currencyId:currencyId,isFreeShipping:isFreeShipping,style:style,availableSizes:availableSizes,installments:installments,productImage:productImage}
        let savedData = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: savedData });

    } catch (err) {
            res.status(500).send({ status: false, message: err.message });
        }
}

const getallProduct = async function (req, res) {
    try {
       let {size,priceSort,name,priceGreaterThan,priceLessThan,...restall}=req.query
       let filters={ 
          "isDeleted":false
       }
       if(Object.keys(req.query).length==0){
          const allProducts=await productModel.find(filters)
          return res.status(200).send({status:true,message:"Success",data:allProducts})
       }
       if(Object.keys(restall).length>0){
          return res.status(400).send({status:false,message:"The filters can only size,priceSort,name,priceGreaterThan or priceLessThan"})
       }
       if(size){
        size=JSON.parse(size)
       if(!validSize(size)){
          return res.status(400).send({status:false,message:"The size can be only S, XS,M, X, L, XXL"})
       }
       console.log(size)
       filters["availableSizes"]=size
      }
      let newsort
      if(priceSort){
        newsort=[1,-1,"1","-1"]
          if( ! newsort.includes(priceSort))
          return res.status(400).send({status:false,message:"value of priceSort can be 1 or -1 only"})
      }
      if(name){
          filters["title"]={"$regex":name,"$options":"i"}////confusion about title and description
      }
      let gt
      if(priceGreaterThan){
        let intergerPriceGreaterThan = parseInt(priceGreaterThan)
        console.log(typeof(intergerPriceGreaterThan))
          if(typeof(intergerPriceGreaterThan)!=Number && intergerPriceGreaterThan==NaN ){
           return res.status(400).send({status:false,message:"value of priceGreaterThan can be numbers only"})
          }
          gt=intergerPriceGreaterThan
      }
      let lt
      if(priceLessThan){
        let intergerPriceLessThan = parseInt(priceLessThan)
        console.log(typeof(intergerPriceLessThan))
          if(typeof(intergerPriceLessThan)!==Number && intergerPriceLessThan==NaN ){
           return res.status(400).send({status:false,message:"value of priceLessThan can be numbers only"})
          }
          lt=intergerPriceLessThan
      }
      
      if (lt && gt) {
        filters["price"] = {
          "$gt": gt,
          "$lt": lt
        };
      } else if (lt) {
        filters["price"] = { "$lt": lt };
      } else if (gt) {
        filters["price"] = {"$gt": gt};
      }
     
   console.log(filters)
  
      const findMatch=await productModel.find(filters).sort({"price":priceSort})
  
      return res.status(200).send({status:true,message:"Matched products",data:findMatch})
  
    } catch (err) {
     return res.status(500).send({ status: false, message: err.message });
    }
  };

const productByid = async (req, res)=>{
    try {
      let productId = req.params.productId;
      if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "this is Invalid id " });
      let product = await productModel.findOne({_id: productId,isDeleted: false,});
      if (!product)return res.status(404).send({status: false,message: "No such products found or product has already deleted",
        });
      return res.status(200).send({ status: true, message: "Success", data: product });
    } catch (error) {
      return res.status(500).send({ status: false, message: error.message });
    }
  };
  
  const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId;
        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }

        let checkProductId = await productModel.findOne({ _id: productId })
        if (!checkProductId) { return res.status(404).send({ status: false, msg: "Product not found for the request id" }) }
        if (checkProductId.isDeleted == true) { return res.status(404).send({ status: false, msg: "Product is already deleted" }) }

        /*----------------------------------------------------------------------------------------------------------------------*/

        let data = req.body;
        let files = req.files;

        /*--------------------------------------------file Updation--------------------------------------------------------------*/

        if (isvalidBody(data)) { return res.status(400).send({ status: false, message: "Please provide data to update" }) }

        //CHECKING ProductImage
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            data.productImage = uploadedFileURL;
        } 

        /*--------------------------------------------Title Validation------------------------------------------------------------*/

        if (data.title || data.title == "string") {
            if (isvalid(data.title)) {
                return res.stauts(400).send({ status: false, msg: "title should be not empty string" })
            }

            //checking title duplicasy
            let titleExist = await productModel.findOne({ title: data.title })
            if (titleExist) { return res.status(400).send({ status: false, msg: "title is already exist" }) }
        }
        /*-------------------------------------------Description Validation--------------------------------------------------------*/

        if (data.description || data.description == "string") {
            if (isvalid(data.description)) {
                return res.stauts(400).send({ status: false, msg: "Description should be not empty string" })
            }
        }
        /*--------------------------------------------Price Validation------------------------------------------------------------*/


        if (data.price || data.price == "string") {
            if (priceRegex(data.price)) {
                return res.stauts(400).send({ status: false, msg: "price should be not empty string" })
            }
           }

        /*--------------------------------------------isFreeShipping validation-----------------------------------------------------*/
         
        if (data. isFreeShipping || data. isFreeShipping == "string") {
            if (isvalid(data. isFreeShipping)) {
                return res.stauts(400).send({ status: false, msg: " isFreeShipping should be not empty string" })
            }

        }

        /*-----------------------------------------------style validation-------------------------------------------------------------------*/

if (data. style || data. style == "string") {
            if (isvalid(data. style)) {
                return res.stauts(400).send({ status: false, msg: " style should be not empty string" })
            }

        }
        /*----------------------------------------------AvailableSizes Validation------------------------------------------------------------*/
        const validSize=function(arrayOfSize){
            //arrayOfSize =JSON.parse(arrayOfSize)

            const standardSizes=["S", "XS", "M", "X", "L", "XXL", "XL"]
            for(let i=0;i<arrayOfSize.length;i++){
                console.log(arrayOfSize[i])
            if(!standardSizes.includes(arrayOfSize[i])) return false}
            return true
        }
        

        /*---------------------------------------------------------------------------------------------------------------------------*/   
           const updateDetails = await productModel.findByIdAndUpdate({ _id: productId, isDeleted: false }, data, { new: true })
           return res.status(200).send({ status: true, message: "User profile updated successfully", data: updateDetails })
    } catch (error) {

    }
}

const deleteProduct=async function(req,res){
    try{
       const productId=req.params.productId
       if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }
       const findProduct=await productModel.findById(productId)
       if(findProduct.isDeleted==true || findProduct==null){
          return res.status(404).send({status:false,message:"The product is not present or it may be deleted"})
       }
       const deleteById=await productModel.findByIdAndUpdate(
          {productId},
          {$set:{"isDeleted":true,deletedAt:Date.now()}}
       )
       return res.status(200).send({status:true,message:"Deleted Successfully"})
    }
    catch (err) {
       return res.status(500).send({ status: false, message: err.message });
      }
 }


  module.exports = {createProduct,productByid,updateProduct,getallProduct,deleteProduct}