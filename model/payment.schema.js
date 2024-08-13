
import mongoose from "mongoose";

//razorpay ke paas baki kitne ka payment tha kitna payment tha yeh saari information rasorpay ke paas hoti hai then humko sirf razorpay ka refrence chahiye
const paymentSchema=new mongoose.Schema({
//yahan hum log razor_pay use kar rhe hai is liye direct razorpaypaymentid le rhe hai acchi practice yeh hai ki yahan par sirf payment_id len because hum koi aur service bhi use kar sakte hai
    razorpay_payment_id:{
        type:String,
        required:[true,'razorpay_payment_id is required'],

    },
    razorpay_subscription_id:{
     type:String,
     required:[true,'razorpay_subscription_id is required']
     
    },
    razorpay_signature:{
        type:String,

    }
    
},{
    timestamps:true
})



export default mongoose.model('payment',paymentSchema);