
import jwd from "jsonwebtoken";
import AppError from "../utils/error.utils.js";
import { json } from "express";

const isloggedin=async(req,res,next)=>{
    // const token=req.rawHeaders[1];
    const token=req.cookies.token;//yeh cookie parser ki help se parse hua hai yahan
// console.log("req",req);
// console.log("req.cookies",req.cookies);
// console.log("token>>",token);
    // console.log("token",req.rawHeaders[1]);

    if(!token){
        return next(new AppError("unauthenticated,please login again",401));
    }
    //yeh user object jwd token se  rha n ki db se
    const userDetails=await jwd.verify(token,process.env.SECRET);//return the decoded token means payload
    //jab bhi loggedin function call hoga woh request.body me ek user object de dega
    req.body.user=userDetails;
    
    next();
    
}
    
export default isloggedin;