import express from 'express';
const router = express.Router();
import * as AuthController from '../Controllers/AuthController.js';
import * as EmailVerification from '../Controllers/EmailVerification.js';
//const { checkUser } = require('../middleware/authMiddleware');
router.post("/Login", AuthController.LoginPost);
router.post("/Signup",AuthController.SignupPost);
router.get("/VerifyUser/:id",EmailVerification.VerifyUser);

export {router};