
import userModel from "../model/user.schema.js";
import AppError from "../utils/error.utils.js";

export const  getUserDetail=async (req,res,next)=>{

    try {


        const allUserCount=await userModel.find({
            role:'USER'
        }).count();
        const subscribedCount=await userModel.find({ 'subscription.status': 'ACTIVE' }).count();
        console.log("allUserCount",allUserCount);
        console.log("subscribedCount",subscribedCount);

        return res.status(200).json({
success:true,
message:"all user detail succesfully send",
allUserCount,
subscribedCount
        })

        
    } catch (error) {
        
        return new AppError(error.message,400);

    }



}
