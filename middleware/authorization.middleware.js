


//this function call like authorization()() this
//...roles sare roles ka ek array bna dega yahan woh roles dene hai jo allow hai

import AppError from "../utils/error.utils.js";
import mongoose from "mongoose";
import usermodel from "../model/user.schema.js";

//means agar sirf user hai to 'user' and sirf admin hai to 'admin'
const authorization=(...roles)=>async(req,res,next)=>{
//yeh wali middleware isloggedin ke baad chalegi then req.body.user me sari user ki information aa chuki hogi

const id=req.body.user.id;

const currentRole= await usermodel.findById(id);
console.log(currentRole);
const actualRole=currentRole.role

if(!roles.includes(actualRole)){
    return next(new AppError('you are not authorized',403));
    //403 is authentication error
}

next();
}


export const authorizedsubscriber=async (req,res,next)=>{

    console.log("req.user",req.body.user,req.body.user.subscription.status);

    const userData=await usermodel.findById(req.body.user.id);

if(userData.role!='ADMIN'&&userData.subscription.status!='ACTIVE'){

    return new AppError("please subscrible to access this route",403);

}
next();

};



export default authorization;