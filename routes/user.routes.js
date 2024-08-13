
import express from "express";
import { register,login,logout,getprofile,forgot,reset,changepassword,updateuser } from "../controller/user.controller.js";
import isloggedin from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
const router= express.Router();

//upload is a function .single means we are uploading one file if we want rto upload multiple file we use .multiplt

//upload.single('avatar') yeh middleware hai jo check karegi ki form data me agar koi avatar naam ki key hai to uski file ko binary to image change karke usko upload(ek folder me store) karke us folder ka path de degi req.file me
router.post('/register',upload.single('avatar'),register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',isloggedin,getprofile);
router.post('/forgot-password',forgot);
router.post('/reset-password/:resetToken',reset);
router.post('/changepassword',isloggedin,changepassword);
router.put('/update/:id',upload.single('avatar'),isloggedin,updateuser);
//if pehele hum isloggedin check kar rhe hain thart not work
//update user means we update the profile of user


export default router;