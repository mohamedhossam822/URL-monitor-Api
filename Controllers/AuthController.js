const mongoose = require("mongoose");
const validator = require("email-validator");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const { sendMail }=require("./Helpers/SendingEmail.js");


const maxAge = 24 * 60 * 60; //hours*min*secs //1 Day
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
      if(User==null){
          return res.status(422).json({
          error: "Email or password are invalid!",
          });
      }
      if(!User.verified){
        fullUrl = req.protocol + '://' + req.get('host')+'/VerifyUser/'+User._id;
        sendMail(User.email,fullUrl)
        return res.status(423).json({
            message: "Please Verify your email, A email will be sent"
          });
        }
        
        const token = createToken(User._id);
            return res.status(200).json({
            message: "Logged in successfully!",
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
        //Create new patient
        const user = new User(newUser);
  
        //Save patient to database
        user
          .save()
          .then((user) => {
            //Send email
            fullUrl = req.protocol + '://' + req.get('host')+'/VerifyUser/'+user._id;
            sendMail(user.email,fullUrl)
            
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
    return jwt.sign({ id }, process.env.SECRET, {
      expiresIn: maxAge,
    });
  }


  module.exports = {
    LoginPost, SignupPost
};