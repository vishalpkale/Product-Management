

let authentication = async function (req, res, next) {

    //authentication code
    try {
      let token = req.headers["x-auth-token"];
      if (!token) return res.status(400).send({ status: false, msg: "token must be present" });
  
      jwt.verify(token, "This is secret key", (error, decodedToken) => {
        if (error) {
          let message = (error.message == "jwt expired" ? "token is expired ,please login again" : "token is invalid,please recheck your token")
          return res.status(401).send({ status: false, msg: message })
        }
        // console.log(decodedToken)
        req.decodedToken = decodedToken;
        next();
      });
  
    }
    catch (error) {
      return res.status(500).send(error.message);
    }
  }