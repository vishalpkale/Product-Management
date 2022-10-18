const userModel = require('../model/userModel')
const bcrypt = require('bcrypt');
const {uploadFile}=require("../aws/aws");
const jwt = require('jsonwebtoken');
const {validImage,isValidObjectId,stringRegex,phoneRegex,emailRegex,pincodeRegex,passwordRegex}=require("../validation/validator")

const createUser = async (req, res) => {
    try {
        
        let files = req.files;
        let profileImage
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            profileImage = uploadedFileURL;  
        }
       if (Object.keys(req.body).length == 0 && !profileImage) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "for updation user data is required",
                });
        }
        let { fname, lname, email, phone, password, address } = req.body;
       

        if (!fname) {return res.status(400).send({ status: false, message: "Enter your  fname" }); }
        if (!lname) {return res.status(400).send({ status: false, message: "Enter your  lname" }); }
        if (!email) {return res.status(400).send({ status: false, message: "Enter your  email" }); }
        if (!phone) {return res.status(400).send({ status: false, message: "Enter your  phone" }); }
        if (!password) {return res.status(400).send({ status: false, message: "Enter your  password" }); }
        if (!address) {return res.status(400).send({ status: false, message: "Enter your  Address" }); }
        address = JSON.parse(address)
        if (!address['shipping']) {return res.status(400).send({ status: false, message: "Enter your shipping Address" }); }
        if (!address['shipping']['street']) {return res.status(400).send({ status: false, message: "Enter your shipping street" }); }
        if (!address.shipping.city) {return res.status(400).send({ status: false, message: "Enter your shipping city" }); }
        if (!address.shipping.pincode) {return res.status(400).send({ status: false, message: "Enter your shipping pincode" }); }
        if (!address.billing) {return res.status(400).send({ status: false, message: "Enter your billing " }); }
        if (!address.billing.street) {return res.status(400).send({ status: false, message: "Enter your billing street" }); }
        if (!address.billing.city) {return res.status(400).send({ status: false, message: "Enter your billing city" }); }
        if (!address.billing.pincode) {return res.status(400).send({ status: false, message: "Enter your billing pincode" }); }
         

        if (!profileImage) {return res.status(400).send({ status: false, message: "please provide profileImage" }); }

        if (!stringRegex(fname)) {return res.status(400).send({ status: false, message: "Please enter a valid FName" });}
        if (!stringRegex(lname)) {
            return res
                .status(400)
                .send({ status: false, message: "Please enter a valid LName" });
        }
        if (!phoneRegex(phone)) {
            return res
                .status(400)
                .send({ status: false, message: "Please Enter valid phone Number" });
        }

        let existphone = await userModel.findOne({ phone: phone });
        if (existphone) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "User with this phone number is already registered.",
                });
        }

        if (!emailRegex(email)) {
            return res
                .status(400)
                .send({ status: false, message: "Please Enter valid Email" });
        }

        let existEmail = await userModel.findOne({ email: email });
        if (existEmail) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "User with this email is already registered",
                });
        }

        if (!passwordRegex(password)) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "please Enter valid Password and it's length should be 8-15",
                });
        }

        if (!pincodeRegex(address.shipping.pincode))
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Please enter valid shipping pincode",
                });
        if (!stringRegex(address.shipping.city))
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Please enter valid city address for shipping ",
                });
        if ((address.shipping.street).trim().length == 0)
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Please enter valid street address for shipping ",
                });
        if (!stringRegex(address.billing.city))
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Please enter valid city address for billing ",
                });
        if ((address.billing.street).trim().length == 0)
            return res
                .status(400)
                .send({
                    status: false,
                    message: "Please enter valid city address for billing ",
                });
         if (!pincodeRegex(address.billing.pincode))
                return res
                    .status(400)
                    .send({ status: false, message: "Please enter valid billing pincode" });

       
        password = await bcrypt.hash(req.body.password, 10);
        // console.log(password);
        const dataForCreation={
            fname: fname,
            lname: lname,
            email: email,
            profileImage: profileImage,
            phone: phone,
            password: password,
            address: address,
        };
        const savedData = await userModel.create(dataForCreation);
        return res
            .status(201)
            .send({ status: true, message: "Success", data: savedData });
    } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
    }
};



const getUserDetails = async function (req, res) {
    try {
      const userId = req.params.userId;
    
      if (!userId)
        return res
          .status(400)
          .send({ status: false, message: "Please provide userId." });
  
      if (!isValidObjectId(userId))
        return res
          .status(400)
          .send({ status: false, message: "Please provide a valid userId." });
        
  
      const userData = await userModel.findById(userId);
      if (!userData)
        return res
          .status(404)
          .send({ status: false, message: "user not found." });
  
      return res
        .status(200)
        .send({ status: true, message: "User profile details", data: userData });
    } catch (err) {
      res.status(500).send({ status: false, message: err.message });
    }
  };
  
//   module.exports = {getUserDetails}

const loginUser = async function (req, res) {
    try {
      let { email, password } = req.body;
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, message: "for login user data is required" })
        }
      const user = await userModel.findOne({ email: email});
      if (!user) {
        return res.status(400).send({ status: false, message: "Please enter your correct emailId" });
      }
      let hpassword = await bcrypt.compare(password,user.password)
      if(hpassword==false)return res.status(400).send({status:false,message:"Please enter your correct password"})

      let exp = "20h";
      const token = jwt.sign(
        { userId: (user._id).toString() },
        "Project-5_Group-34",
        { expiresIn: exp }
      );
    //   res.setHeader("x-api-key", token);
      let datas= {token:token, userId:user._id, iat:Date.now(), exp:exp}
      res.status(201).send({ status: true, message: "Login successfully...!", data: datas });
    } catch (error) {
      res.status(500).send({ status: false, err: error.message });
    }
  };


const updateProfile = async function (req, res) {
    try {
         const userId=req.params.userId
        if (!isValidObjectId(userId))
        return res
          .status(400)
          .send({ status: false, message: "Please provide a valid userId." });
       
        let { fname, lname, email,  phone, password, address } = req.body;
        let updates = {}

        let files = req.files;
        let profileImage
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);

            profileImage = uploadedFileURL;
            
            updates["profileImage"] = profileImage
        }
       if (Object.keys(req.body).length == 0 && !profileImage) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "for updation user data is required",
                });
        }
        if (fname) {
            if (!stringRegex(fname)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Please enter a valid FName" });
            }
            updates["fname"]=fname
        }
        if (lname) {
            if (!stringRegex(lname)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Please enter a valid LName" });
            }
            updates["lname"]=lname
        }
        if (email) {
            if (!emailRegex(email)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Please Enter valid Email" });
            }
            let existEmail = await userModel.findOne({ email: email });
            if (existEmail) {
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "User with this email is already registered",
                    });
            }
            updates["email"]=email
        }
        if (phone) {
            if (!phoneRegex(phone)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Please Enter valid phone Number" });
            }
            let existphone = await userModel.findOne({ phone: phone });
            if (existphone) {
                return res
                    .status(400)
                    .send({
                        status: false,
                        message: "User with this phone number is already registered.",
                    });
            }
            updates["phone"]=phone
        }
        if (password) {
            if (!passwordRegex(password)) {
                return res
                    .status(400)
                    .send({
                        status: false,
                        message:
                            "please Enter valid Password and it's length should be 8-15",
                    });
            }
            const salt = await bcrypt.genSalt(10);
            password = await bcrypt.hash(req.body.password, salt);
            updates["password"]=password 
        }
        if (address) {
            address = JSON.parse(address)
            if (address.shipping) {
                if (address.shipping.street) {
                    if (address.shipping.street.trim().length == 0)
                     return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid street address for shipping ",
                            })                 
                 updates["address.shipping.street"]=address.shipping.street
                }
                if (address.shipping.city) {
                        if(!stringRegex(address.shipping.city))
                        return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid city address for shipping ",
                            });
                        updates["address.shipping.city"]=address.shipping.city
                }
                if (address.shipping.pincode) {
                    if (!pincodeRegex(address.shipping.pincode))
                        return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid shipping address pincode",
                            });
                updates["address.shipping.pincode"]=address.shipping.pincode
                }
            }
            if (address["billing"]) {
                if (address["billing"]["street"]) {
                    if (address.billing.street.trim().length == 0)
                        return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid street address for billing ",
                            });
                            updates["address.billing.street"]=address.billing.street
                }
                if (address.billing.city) {
                    if (address.billing.city){
                        if(!stringRegex(address.billing.city))
                        return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid city address for billing ",
                            });
                        }
                        updates["address.billing.city"]=address.billing.city
                }
                if (address.billing.pincode) {
                    if (!pincodeRegex(address.billing.pincode))
                        return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid billing address pincode",
                            });
                    updates["address.billing.pincode"]=address.billing.pincode
                }
            }
        }
        console.log(updates)
            let updateUser = await userModel.findByIdAndUpdate(
                { _id: userId },
                { $set:  updates},
                { new: true }
            );
            return res.status(200).send({ status: true, data: updateUser });
        } catch (error) {
            return res.status(500).send({ status: false, error: error.message });
        }
    };

    module.exports = {createUser,getUserDetails,loginUser,updateProfile}
