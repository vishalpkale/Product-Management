const userModel = require('../model/userModel')
const bcrypt = require('bcrypt');
const {uploadFile}=require("../aws/aws");
const { default: mongoose } = require('mongoose');
const jwt = require('jsonwebtoken');
const {isValidObjectId,stringRegex,phoneRegex,emailRegex,pincodeRegex,passwordRegex}=require("../validation/validator")

// const saltRounds = 10;

// let isvalid = (value)=>{
//     if (typeof value == 'undefined' || value == null) return false
//     if (typeof value == 'string' && value.trim().length == 0&&value == null) return false
//     if(typeof value =="number" && value.toString().trim.length==0) return false
//     return true
// }



const createUser = async (req, res) => {
    try {
        
        if (Object.keys(req.body).length == 0) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "for registration user data is required",
                });
        }
        let { fname, lname, email, profileImage, phone, password, address } = req.body;

        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);

            profileImage = uploadedFileURL;
        } else {
            return res.status(400).send({ message: "No file found" });
        }

        

        if (!stringRegex(fname)) {
            return res
                .status(400)
                .send({ status: false, message: "Please enter a valid FName" });
        }
        if (!stringRegex(lname)) {
            return res
                .status(400)
                .send({ status: false, message: "Please enter a valid LName" });
        }
        if (phoneRegex(phone)) {
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
        if (address.shipping.street.trim().length == 0)
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
        if (address.billing.street.trim().length == 0)
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

        const salt = await bcrypt.genSalt(10);
        password = await bcrypt.hash(req.body.password, salt);
        console.log(password)

        console.log(password);
        const hello = {
            fname: fname,
            lname: lname,
            email: email,
            profileImage: profileImage,
            phone: phone,
            password: password,
            address: address,
        };
        let savedData = await userModel.create(hello);
        return res
            .status(201)
            .send({ status: true, message: "Success", data: savedData });
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};



const getUserDetails = async function (req, res) {
    try {
      const userId = req.params.userId;
    //   userId = "62fd292d338c06ccba81c98d";
  
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
        if (!emailRegex(email)) {
            return res
                .status(400)
                .send({ status: false, message: "Please Enter valid Email" });
        }
        if (!passwordRegex(password)) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "please Enter valid Password and it's length should be 8-15",
                });
        }

      const user = await userModel.findOne({ email: email});
      if (!user) {
        return res.status(400).send({ status: false, message: "Please enter your correct emailId" });
      }
      let hpassword = await bcrypt.compare(password,user.password)
      if(hpassword==false)return res.status(400).send({status:false,message:"Please enter your correct password"})

// console.log(hpassword)
      let exp = "20h";
      const token = jwt.sign(
        { userId: (user._id).toString() },
        "Project-3_Group-5",
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
        if (Object.keys(req.body).length == 0) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "for updation user data is required",
                });
        }
        let { fname, lname, email, profileImage, phone, password, address } = req.body;
        let files = req.files;
        if (files && files.length > 0) {
            let uploadedFileURL = await uploadFile(files[0]);
            profileImage = uploadedFileURL;
        } else {
            return res.status(400).send({ message: "No file found" });
        }

        if (fname) {
            if (!stringRegex(fname)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Please enter a valid FName" });
            }
        }
        if (lname) {
            if (!stringRegex(lname)) {
                return res
                    .status(400)
                    .send({ status: false, message: "Please enter a valid LName" });
            }
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
        }
        if (address) {
            if (address["shipping"]) {
                if (address["shipping"]["street"]) {
                    if (address.shipping.street.trim().length == 0)
                        return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid street address for shipping ",
                            });
                }
                if (address.shipping.city) {
                    if (address.shipping.city){
                        if(!stringRegex(address.shipping.city))
                        return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid city address for shipping ",
                            });
                        }
                }
                if (address.shipping.pincode) {
                    if (!pincodeRegex(address.shipping.pincode))
                        return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid shipping address pincode",
                            });

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
                }
                if (address.billing.pincode) {
                    if (!pincodeRegex(address.billing.pincode))
                        return res
                            .status(400)
                            .send({
                                status: false,
                                message: "Please enter valid billing address pincode",
                            });

                }
            }
        }
            const salt = await bcrypt.genSalt(13);
            password = await bcrypt.hash(req.body.password, salt);

            console.log(password);
            const updates = {
                "fname": fname,
                "lname": lname,
                "email": email,
                "profileImage": profileImage,
                "phone": phone,
                "password": password,
                "address": address,
            };

            let updateUser = await userModel.findByIdAndUpdate(
                { _id: userId },
                { $set: { ...updates } },
                { new: true }
            );
            return res.status(200).send({ status: true, data: updateUser });
        } catch (error) {
            return res.status(500).send({ status: false, error: error.message });
        }
    };

    module.exports = {createUser,getUserDetails,loginUser,updateProfile}
