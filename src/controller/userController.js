const userModel = require('../model/userModel')
const bcrypt = require('bcrypt');
const {uploadFile}=require("../aws/aws");
const { default: mongoose } = require('mongoose');
const jwt = require('jsonwebtoken');

// const saltRounds = 10;


// let isvalid = (value)=>{
//     if (typeof value == 'undefined' || value == null) return false
//     if (typeof value == 'string' && value.trim().length == 0&&value == null) return false
//     if(typeof value =="number" && value.toString().trim.length==0) return false
//     return true
// }

const createUser = async (req, res) => {
    try {
        // console.log(req.body)
        // req.body=JSON.parse(JSON.stringify(req.body))
        // console.log(req.body)
        if (Object.keys(req.body).length == 0) {
            return res.status(400).send({ status: false, msg: "for registration user data is required" })
        }
        let { fname,lname ,email,profileImage, phone,password,address} = req.body

        let files= req.files
    if(files && files.length>0){
    
        let uploadedFileURL= await uploadFile(files[0])

    
        profileImage=uploadedFileURL
    }
    else{
        return res.status(400).send({ msg: "No file found" })
    }

        // console.log(typeof fname)
        // let {street,city,pincode}=address.shipping
        if (!fname) {return res.status(400).send({ status: false, msg: "Enter your  fname" }); }
        if (!lname) {return res.status(400).send({ status: false, msg: "Enter your  lname" }); }
        if (!email) {return res.status(400).send({ status: false, msg: "Enter your  email" }); }
        if (!profileImage) {return res.status(400).send({ status: false, msg: "Enter your  profilrImage" }); }
        if (!phone) {return res.status(400).send({ status: false, msg: "Enter your  phone" }); }
        if (!password) {return res.status(400).send({ status: false, msg: "Enter your  password" }); }
        if (!address) {return res.status(400).send({ status: false, msg: "Enter your  Address" }); }
        if (!address['shipping']) {return res.status(400).send({ status: false, msg: "Enter your shipping Address" }); }
        if (!address['shipping']['street']) {return res.status(400).send({ status: false, msg: "Enter your shipping street" }); }
        if (!address.shipping.city) {return res.status(400).send({ status: false, msg: "Enter your shipping city" }); }
        if (!address.shipping.pincode) {return res.status(400).send({ status: false, msg: "Enter your shipping pincode" }); }
        if (!address.billing) {return res.status(400).send({ status: false, msg: "Enter your billing pincode" }); }
        if (!address.billing.street) {return res.status(400).send({ status: false, msg: "Enter your billing pincode" }); }
        if (!address.billing.city) {return res.status(400).send({ status: false, msg: "Enter your billing pincode" }); }
        if (!address.billing.pincode) {return res.status(400).send({ status: false, msg: "Enter your billing pincode" }); }
      
         if (!(/^[a-zA-Z]{2,}(?: [a-zA-Z]+){0,2}$/).test(fname)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid FName" })
        }
        if (!(/^[a-zA-Z]{2,}(?: [a-zA-Z]+){0,2}$/).test(lname)) {
            return res.status(400).send({ status: false, msg: "Please enter a valid LName" })
        }
        if (!(/^[\s]*[6-9]\d{9}[\s]*$/).test(phone)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid phone Number" })
        }


        let existphone = await userModel.findOne({ phone: phone })
        if (existphone) { return res.status(400).send({ status: false, msg: "User with this phone number is already registered." }) }

            if (!(/^[a-z0-9_]{1,}@[a-z]{3,10}[.]{1}[a-z]{3}$/).test(email)) {
            return res.status(400).send({ status: false, msg: "Please Enter valid Email" })
        }
        
        let existEmail = await userModel.findOne({ email: email })
        if (existEmail) {

            return res.status(400).send({ status: false, msg: "User with this email is already registered" })
        }

        if (!(/^[\s]*[0-9a-zA-Z@#$%^&*]{8,15}[\s]*$/).test(password)) {                                            
            return res.status(400).send({ status: false, message: "please Enter valid Password and it's length should be 8-15" })
        }

        if(!(/^[1-9][0-9]{5}$/).test(address.shipping.pincode))return res.status(400).send({status:false,message:"Please enter valid shipping pincode"})
        if(!(/^[1-9][0-9]{5}$/).test(address.billing.pincode))return res.status(400).send({status:false,message:"Please enter valid billing pincode"})

        if(address.shipping.city.trim().length==0)return res.status(400).send({status:false,message:"Please enter valid city address for shipping "})
        if(address.shipping.street.trim().length==0)return res.status(400).send({status:false,message:"Please enter valid street address for shipping "})
        if(address.billing.city.trim().length==0)return res.status(400).send({status:false,message:"Please enter valid city address for billing "})
        if(address.billing.city.trim().length==0)return res.status(400).send({status:false,message:"Please enter valid city address for billing "})

        const salt = await bcrypt.genSalt(13)
          password = await bcrypt.hash(req.body.password, salt)


        const hello ={
            fname:fname,lname:lname ,email:email,profileImage:profileImage, phone:phone,password:password,address:address}

        let savedData = await userModel.create(hello);
        // console.log(savedData)
        return res.status(201).send({ status: true, message: 'Success', data: savedData });


    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

const getUserDetails = async function (req, res) {
    try {
      const userId = req.params.userId;
    //   userId = "62fd292d338c06ccba81c98d";
  
      if (!userId)
        return res
          .status(400)
          .send({ status: false, message: "Please provide userId." });
  
      if (!mongoose.Types.ObjectId.isValid(userId))
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

// console.log(hpassword)
      let exp = "20h";
      const token = jwt.sign(
        { userId: user._id },
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



module.exports = {createUser,getUserDetails,loginUser}

