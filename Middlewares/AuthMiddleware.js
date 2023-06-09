import * as jwt from "jsonwebtoken";
import mongoose from 'mongoose';
const User = mongoose.model("User");

const authenticate = (req, res, next) => {
    const token = req.headers.authtoken;

    // check if  token exists
    if (!token) return res.status(401).json("Unauthorized");
    
    //Verify The token
    jwt.verify(token, process.env.SECRET, async (err, decodedToken) => {
      //Verification Failed
      if (err) return res.status(401).json("Unauthorized");
      
      //Check If User exists
      const user= await User.findById(decodedToken.id);
      if(user==null)  return res.status(422).json("User wasn't found,Try re-signing in");

      // Verification Success
      res.locals.userId=user._id;
      next();
       
      });
  };
export{
    authenticate
  }