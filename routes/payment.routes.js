
import express from "express";
import isloggedin from "../middleware/auth.middleware.js";
import authorization,{authorizedsubscriber}  from "../middleware/authorization.middleware.js";
// import authorizedsubscriber from "./middleware/authirizedsubscriber.middleware.js";

import { getRazorPayKey,getSubscription,verify,cancelSubscription,allPayments } from "../controller/payment.controller.js";
const router=express.Router();


router
      .route('/razorpay_key')
      .get(isloggedin,getRazorPayKey);

router 
     .route('/subscribe')
     .post(isloggedin,getSubscription);


router
     .route('/verify')
     .post(isloggedin,verify);

router
     .route('/unsubscribe')
     .post(isloggedin,authorizedsubscriber,cancelSubscription);

router//if anyone is admin then uske payment se related information dikha do
     .route('/')
     .get(isloggedin,authorization('ADMIN'),allPayments);

export default router;