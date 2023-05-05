const express = require("express");
const router = express.Router();
const AuthController = require('../Controllers/AuthController');
const EmailVerification = require('../Controllers/EmailVerification');
//const { checkUser } = require('../middleware/authMiddleware');
router.post("/Login", AuthController.LoginPost);
router.post("/Signup",AuthController.SignupPost);
router.get("/VerifyUser/:id",EmailVerification.VerifyUser);

module.exports = router;