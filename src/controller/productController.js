const productModel = require("../model/productModel")
const { uploadFile } = require("../aws/aws");

const { isValidObjectId, priceRegex, validSize, stringRegex } = require("../validation/validator");
//=====================================post API===============================================================================//
const createProduct = async (req, res) => {
    try {
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "for creation product data is required", });
        }
        //destructing
        let { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = req.body
        let productImage
        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            productImage = uploadedFileURL;
         } 
        if (!productImage) { return res.status(400).send({ status: false, message: "please provide productImage" }); }

        if (!(title) || (!stringRegex(title))) return res.status(400).send({ status: false, message: "please provide tittle and it should be valid" })

        if (!description || !stringRegex(description)) return res.status(400).send({ status: false, message: "please provide description it should be valid" })

        if (!price || !priceRegex(price)) return res.status(400).send({ status: false, message: "please provide price and it should only intergers" })

        if (currencyId != "INR") return res.status(400).send({ status: false, message: "Only indian currency id allowed for example INR" })

        if ((!style) || (!stringRegex(style))) return res.status(400).send({ status: false, message: "please provide style it should be valid" })

        if ((!availableSizes) || !validSize(availableSizes)) return res.status(400).send({ status: false, message: "The size can be only S, XS,M, X, L, XXL" })
        ////converting given string into array
        availableSizes = availableSizes.toUpperCase().split(",").map((x) => x.trim())

        if(isFreeShipping){
            let arr =[true,false,"true","false"]
            if(!arr.includes(isFreeShipping))return res.status(400).send({ status: false, message:"freeshiping will be only true or false"})
          }

        if (!(installments) || !priceRegex(installments) || (installments == 0)) return res.status(400).send({ status: false, message: "please provide installments only in numbers and not have zero i.e. 0" })
        //-----------checking duplication------//
        let uniquetitile = await productModel.findOne({ title: title })
        if (uniquetitile) return res.status(400).send({ status: false, message: "this tittle is already available" })

        const data = { title,description,price,currencyId,isFreeShipping,style,availableSizes,installments,productImage }
        let savedData = await productModel.create(data)
        return res.status(201).send({ status: true, message: "Success", data: savedData });

    } catch (err) {
      return  res.status(500).send({ status: false, message: err.message });
    }
}
//===================================================GET PRODUCT==========================================================================//

const getallProduct = async (req, res)=>{
    try {
        let { size, priceSort, name, priceGreaterThan, priceLessThan,...restall} = req.query
        let filters = {
            "isDeleted": false
        }
        if (Object.keys(req.query).length == 0) {
            const allProducts = await productModel.find(filters)
            return res.status(200).send({ status: true, message: "Success", data: allProducts })
        }
        if (Object.keys(restall).length > 0) {
            return res.status(400).send({ status: false, message: "The filters can only size,priceSort,name,priceGreaterThan or priceLessThan" })
        }
        if (size) {
            filters["availableSizes"] = { "$in": size.toUpperCase().split(",").map((x) => x.trim()) }
        }
        let newsort
        if (priceSort) {
            newsort = [1, -1, "1", "-1"]
            if (!newsort.includes(priceSort))
                return res.status(400).send({ status: false, message: "value of priceSort can be 1 or -1 only" })
        }
        if (name) {
            filters["title"] = { "$regex": name, "$options": "i" }////confusion about title and description
        }
        let gt
        if (priceGreaterThan) {
            let intergerPriceGreaterThan = parseInt(priceGreaterThan)
            if (typeof (intergerPriceGreaterThan) != Number && intergerPriceGreaterThan == NaN) {
                return res.status(400).send({ status: false, message: "value of priceGreaterThan can be numbers only" })
            }
            gt = intergerPriceGreaterThan
        }
        let lt
        if (priceLessThan) {
            let intergerPriceLessThan = parseInt(priceLessThan)
            if (typeof (intergerPriceLessThan) !== Number && intergerPriceLessThan == NaN) {
                return res.status(400).send({ status: false, message: "value of priceLessThan can be numbers only" })
            }
            lt = intergerPriceLessThan
        }

        if (lt && gt) {
            filters["price"] = {
                "$gt": gt,
                "$lt": lt
            };
        } else if (lt) {
            filters["price"] = { "$lt": lt };
        } else if (gt) {
            filters["price"] = { "$gt": gt };
        }

        const findMatch = await productModel.find(filters).sort({ "price": priceSort })
        if (findMatch.length < 1) return res.status(400).send({ status: false, message: "No product found with this filters" })

        return res.status(200).send({ status: true, message: "Success", data: findMatch })

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};
//====================================================GET PRODUCTBYID=========================================================//

const productByid = async (req, res) => {
    try {
        let productId = req.params.productId;
        if (!isValidObjectId(productId)) return res.status(400).send({ status: false, message: "this is Invalid id " });
        let product = await productModel.findOne({ _id: productId, isDeleted: false, });
        if (!product) return res.status(404).send({
            status: false, message: "No such products found or product has already deleted",
        });
        return res.status(200).send({ status: true, message: "Success", data: product });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};

//   ===================================================UPDATE PRODUCT===========================================================

const updateProduct = async (req, res) => {
    try {
        let productId = req.params.productId;
        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }

        let checkProductId = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!checkProductId) { return res.status(404).send({ status: false, message: "Product not found for this productId id or it may be deleted" }) }
        //------------------------------------------------------------------------------------------------------------//
        let { title, description, price, isFreeShipping, style, availableSizes, installments } = req.body
      
        let updateData = {}
        //------------------------------------------------file updation-------------------------------------------------//

        let files = req.files;
        let productImage
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);

            productImage = uploadedFileURL;
            
            updateData["productImage"] = productImage
        }
       if (Object.keys(req.body).length == 0 && !productImage) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "for updation product data is required",
                });
        }

        /*--------------------------------------------Title Validation------------------------------------------------------------*/

        if (title) {
            if (!stringRegex(title)) {
                return res.status(400).send({ status: false, message: "please give valid title for products" })
            }

            //checking title duplicasy
            let titleExist = await productModel.findOne({ title: title })
            if (titleExist) { return res.status(400).send({ status: false, message: "this title is already exist" }) }
            updateData['title'] = title
        }
        /*-------------------------------------------Description Validation--------------------------------------------------------*/

        if (description) {
            if (!stringRegex(description)) {
                return res.status(400).send({ status: false, message: "give valid description for products" })
            }
            updateData['description'] = description
        }
        /*--------------------------------------------Price Validation------------------------------------------------------------*/


        if (price) {
            if (!priceRegex(price)) {
                return res.status(400).send({ status: false, message: "give valid price for product" })
            }
            updateData['price'] = price
        }

        /*--------------------------------------------isFreeShipping validation-----------------------------------------------------*/

        if (isFreeShipping) {
            let arr =[true,false,"true","false"]
            if (!arr.includes(isFreeShipping)){
                return res.status(400).send({ status: false, message: "isFreeShipping is either true or false" })
            }
            updateData['isFreeShipping'] = isFreeShipping
        }

        /*-----------------------------------------------style validation-------------------------------------------------------------------*/

        if (style) {
            if (!stringRegex(style)) {
                return res.status(400).send({ status: false, message: "style should be valid" })
            }
            updateData['style'] = style
        }
        /*----------------------------------------------AvailableSizes Validation------------------------------------------------------------*/
        if (availableSizes) {
            let size1 = ["S", "XS", "M", "X", "L", "XXL", "XL"];
            let size2 = availableSizes.toUpperCase().split(",").map((x) => x.trim())
            for (let i = 0; i < size2.length; i++) {
                if (!size1.includes(size2[i])) {
                    return res.status(400).send({
                        status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'",
                    });
                }
            }
            updateData["availableSizes"] = size2;
        }
        /*----------------------------------------------INSTALLMENT VALIDATION------------------------------------------------------------------*/
        if (installments) {
            if (!priceRegex(installments)) {
                return res.status(400).send({ status: false, message: " installments should be valid" })
            }
            updateData["installments"] = installments;
        }
        /*---------------------------------------------------------------------------------------------------------------------------*/
        const updateDetails = await productModel.findByIdAndUpdate(
                productId ,
            { $set: updateData },
            { new: true })
        return res.status(200).send({ status: true, message: "product updated successfully", data: updateDetails })
    } catch (error) {
        return res.status(500).send({ status: false, error: error.message });
    }
}
//===========================================================================================================================================//


//========================================================DELETE API=======================================================//

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Please provide a valid productId." }) }
        const findProduct = await productModel.findById(productId)
        if ( findProduct == null || findProduct.isDeleted == true) {
            return res.status(404).send({ status: false, message: "The product is not present or it may be deleted" })
        }
        const deleteById = await productModel.findByIdAndUpdate(
             productId ,
            { $set: { "isDeleted": true, deletedAt: Date.now() } }
        )
        return res.status(200).send({ status: true, message: "Deleted Successfully" })
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


module.exports = { createProduct, productByid, updateProduct, getallProduct, deleteProduct }