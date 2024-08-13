import AppError from "../utils/error.utils.js";
import contactModel from "../model/contact.schema.js";

export async function contactUs(req,res){
   
    try{

        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            
            return next(new AppError("Name, email, and message are required.",400));
        }
        
        // Save the contact message (here, just pushing to an array)
        
        const contactData=await contactModel.create(
            {
                name,
                email,
            message
        }
        );
        if(!contactData){
            return next(new AppError("your qwery does not recorded ,please try again later",500))
        }
      
        // You might do additional actions here like sending an email, saving to a database, etc.
        
        res.status(200).json({
            success:true,
             message: 'Contact message received. We will get back to you soon!' 
            });
    }
    catch(err){

res.status(400).json({
success:false,
message:err.message

})

        
    }
    
        
    }
    
    export function userStats(){
        
    }