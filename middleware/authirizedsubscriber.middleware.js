
import usermodel from "../model/user.schema.js";
import AppError from "../utils/error.utils.js";
const authorizedsubscriber=async(req,res,next)=>{

const {id}=req.body.user;

 const user= await usermodel.findById(id);
//  if(user.role=='ADMIN'){
//     next();
//  }

 if(user.subscription.status=='INACTIVE'){
return next(new AppError('you are unsubscribed user',400));
 }
next();


}


export {authorizedsubscriber};