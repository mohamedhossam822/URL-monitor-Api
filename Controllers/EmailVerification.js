import mongoose from "mongoose";
import * as validator from "email-validator";
import * as  jwt from "jsonwebtoken";
const User = mongoose.model("User");


const maxAge = 24 * 60 * 60; //hours*min*secs //1 Day
  /*************************
   *********VerifyUserGet*******
   *************************/
  function VerifyUser  (req, res) {
    const UserId= req.params.id;
    User.findOneAndUpdate({_id:UserId},{ verified : true}).then((user) => {
        res.sendFile('./HTMLFiles/VerificationSuccess.html', {root: '.' })
      })
      .catch((err) => {
        console.log(err);
        res.status(401).json({
            message: "User not found!",
          });
      });
  };
  /************************/

  export  {
    VerifyUser
};
