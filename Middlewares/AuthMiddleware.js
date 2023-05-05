const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = mongoose.model("User");

const Authenticate = (req, res, next) => {
    const token = req.headers.authtoken;
    // check if physician token exists
    if (!token) {
      return res.status(401).json("Unauthorized");
    }
    //Verify The token
    jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
      //Verification Failed
      if (err) {
        return res.status(401).json("Unauthorized");
      }
      // Verification Success
      try{
         const user= await User.findById(decodedToken.id);
         if(user!=null) res.locals.userId=user._id;
        next();
      }catch(err){
        return res.status(422).json("User wasn't found,Try re-signing in");
      }

    });
  };
  module.exports={
    Authenticate
  }