import express from "express";
import isloggedin from "../middleware/auth.middleware.js";
import authorization from "../middleware/authorization.middleware.js";
import { getUserDetail } from "../controller/Admin.controller.js";





const router=express.Router();

router.route('/stats/user').get(isloggedin,authorization('ADMIN'),getUserDetail);




export default router;