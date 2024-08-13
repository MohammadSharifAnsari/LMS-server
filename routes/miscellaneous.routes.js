
import { Router } from "express";
import { contactUs, userStats } from "../controller/miscellaneous.controller.js";
import authorization from "../middleware/authorization.middleware.js";
import isloggedin from "../middleware/auth.middleware.js";


const router= Router();

router.route('/contact').post(contactUs);

router.route('admin/stats/users').get(isloggedin,authorization('ADMIN'),userStats);

export default router;

