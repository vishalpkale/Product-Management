const jwt = require("jsonwebtoken");
const {isValidObjectId} = require("../validation/validator")

const authentication = (req, res, next) => {
    try {
        let token = req.headers["authorization"];
        if (!token)
            return res.status(401).send({ status: false, msg: "token is required" });
           token=token.slice(7)
        jwt.verify(token,"Project-5_Group-34", (error, decoded) =>{
            if (error) {
               let message=(error.message=="jwt expired"?"token is expired,please login again":"token is invalid,not authenticated")
                 return res.status(401).send({ status: false, msg:message });
            } else {
              req.token = decoded;
                next(); }
        });
    } catch (error) {
        res.status(500).send({ status: false, err: error.message });
    }
};


const authorization = async (req,res,next)=>{
    try {
        let decodedToken=req.token
        let userid=req.params.userId
        if(!isValidObjectId(userid)){return res.status(400).send({status:false,message:"plz enter valid userId"})}
        if(userid!=decodedToken.userId){
            return res.status(403).send({status:false,message:"you are not authorised"})
        }else{
            next()
        }
    } catch (error) {
        
    }
}
module.exports={authentication,authorization}