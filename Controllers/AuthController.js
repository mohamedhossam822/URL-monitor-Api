import mongoose from "mongoose";
import * as validator from"email-validator";
import pkg from 'jsonwebtoken';
const {sign} = pkg;
const User = mongoose.model("User");
import { sendMail } from "./Helpers/SendingEmail.js";


const maxAge = 3*24 * 60 * 60; //hours*min*secs //3 Day
  /*************************
   *********LoginPost*******
   *************************/
  function LoginPost  (req, res) {
    //read request Information
    const { email, password } = req.body;
  
    //Check if the e-mail is valid
    if (!validator.validate(email)) {
      return res.status(422).json({
        error: "Please Enter a valid email",
      });
    }
  
    //Authenticate user
    User.findOne({
      email: email,
      password: password,
    }).then((User) => {
      //Invalid credentials
      if(User==null){
          return res.status(422).json({
          error: "Email or password are invalid!",
          });
      }
      //User didn't verify his account
      if(!User.verified){
        const fullUrl = req.protocol + '://' + req.get('host')+'/VerifyUser/'+User._id;
        //Send email to the user to verify their account
        sendMail(User.email,fullUrl)
        return res.status(423).json({
            message: "Please Verify your email, A new email will be sent!"
          });
        }
        //Create token string and send it to the user
        const token = createToken(User._id);
            return res.status(200).json({
            message: "Logged in successfully!, Include this token in all of your requests made to the API in authtoken Header",
            token: token
            });
        });
  };
  /************************/
  
  /**************************
   *********SignupPost*******
   **************************/
  function SignupPost  (req, res) {
    //Read data from the post request
    const newUser = {
      email: req.body.email,
      password: req.body.password
    };
  
    /***Validation***/
  
    //Check if the e-mail is valid
    if (!validator.validate(newUser.email)) {
      return res.status(422).json({
        error: "Please Enter a valid email",
      });
    }
    //Check if password is at least 8 characters long
    if(newUser.password.length<8){
        return res.status(422).json({
            error: "password must be at least 8 characters long",
          });
    }
    //Check if user already exist
    User.findOne({
      email: newUser.email,
    }).then((savedUser) => {
      if (savedUser) {
        return res.status(422).json({
          error: "User already exists with that email",
        });
      }
  
      /***Save User***/
  
        //Leave Hashing for now
        //bcrypt.hash(password, 12).then((hashedpassword) => {});
        //Create new user
        const user = new User(newUser);
  
        //Save user to database
        user
          .save()
          .then((user) => {
            //Send email for the user to verify their account
            const fullUrl = req.protocol + '://' + req.get('host')+'/VerifyUser/'+user._id;
            sendMail(user.email,fullUrl);
            res.status(201).json({
              message: "Saved Successfully, Please Verify your email",
            });
          })
          .catch((err) => {
            console.log(err);
          });
      /****************************************/
    });
  };
  /*************************/

  /**Create Token**/
  function createToken(id) {
    return sign({ id }, process.env.SECRET, {
      expiresIn: maxAge,
    });
  }


  export  {
    LoginPost, SignupPost
};
