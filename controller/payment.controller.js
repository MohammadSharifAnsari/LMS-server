
import AppError from "../utils/error.utils.js";
import usermodel from "../model/user.schema.js";
import paymentmodel from "../model/payment.schema.js";
import coursemodel from "../model/course.schema.js";
import { razorpay } from "../server.js";
import crypto from "crypto";
import axios from "axios";
const getRazorPayKey = async (req, res, next) => {
    try {
console.log("razorpay backend");
        res.status(200).json(
            {
                success: true,
                message: 'razorPay key :',
                key: process.env.RAZORPAY_KEY_ID

            }
        )

    }
    catch (err) {

        return next(new AppError(err.message, 400));
    }

}

const getSubscription = async (req, res, next) => {
    try {
        //jab bhi subscription lene jate hai then islogged ke baad bhi check karte hai ki yeh valid user hai ki nhibecause yeh payment ki baat ho rhi hai

        const { id } = req.body.user;
        console.log("id=",id);

        const user = await usermodel.findById(id);
        if (!user) {

            return next(new AppError('unauthorized,please login', 400));
        }
        if (user.role == 'ADMIN') {

            return next(new AppError('admin cannot purchase subscription', 400));
        }

       




        // ab agar user as a user login hai then ek unique subscription razorpay pe create hoga

        // is particular plan ke liye humara razor pay par ek subscription bna do
        // woh pura subscription bnaa degi jisme subscription id and status and aur bhi chezen hongi
        const subscription= await razorpay.subscriptions.create({
            plan_id:process.env.RAZORPAY_PLAN_ID,
            customer_notify: 1,
            quantity: 5,
            total_count: 6,
     
            addons: [
              {
                item: {
                  name: "Delivery charges",
                  amount: 499,
                  currency: "INR"
                }
              }
            ],
            notes: {
              key1: "value3",
              key2: "value2"
            }
          })
    
        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;//first time me user ka subscription inactive mark hota hai after payment hum isko active karte hai


        await user.save();

        res.status(200).json({
            success: true,
            message: 'you are subscribed',
            subscription_id: subscription.id
        })
        //is subscription is react pe jaegi aur then react me is id ke through hi payment initiate hoga


    }
    catch (err) {
        
        return next(new AppError(err.message, 400));
    }



}

// const getSubscription = async (req, res, next) => {
//     try {
//         //jab bhi subscription lene jate hai then islogged ke baad bhi check karte hai ki yeh valid user hai ki nhibecause yeh payment ki baat ho rhi hai

//         const { id } = req.body.user;

//         const user = await usermodel.findById(id);
//         if (!user) {

//             return next(new AppError('unauthorized,please login', 400));
//         }
//         if (user.role == 'ADMIN') {

//             return next(new AppError('admin cannot purchase subscription', 400));
//         }

//         const options = {
//             amount: 50000,  // amount in the smallest currency unit
//             currency: "INR",
//             receipt: "order_rcptid_11"
//           };
//          const subscription=await razorpay.orders.create(options);



// user.subscription.id = subscription.id;
// user.subscription.status = subscription.status;
      


//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: 'you are subscribed',
//             subscription_id: subscription.id
//         })
//         //is subscription is react pe jaegi aur then react me is id ke through hi payment initiate hoga


//     }
//     catch (err) {
        
//         return next(new AppError(err.message, 400));
//     }



// }

const verify = async (req, res, next) => {

    // razorpay_payment_id,razorpay_signature,razorpay_subscription_id
    //payment gateway react par redirect karhte  waqt yhi signature deta hai and react par jane se pehle humara yeh verify function verify karta hai ki payment ho gya ya nhi agar payment ho gya then hum react ke ui par pahunvh jate hai
    try {
        // yahan bhi dobara check kar rhe hai ki user exist kar rha hai ya nhi
        const { id } = req.body.user;
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;
        const user = await usermodel.findById(id);
        if (!user) {
            return next(new AppError('unauthorized,please login', 400));

        }
        if (user.role == 'ADMIN') {

            return next(new AppError('admin cannot puchase subscription', 400));
        }

        const subscriptionId = await user.subscription.id;
        //verification karne ka tarika ki ek signature banaenge hum khud using subscriptionId and secret key agar humari banai hui signature and req.body me aai hui signature barabar hui then hum kahenge ki npayment ho gya if bothe are different then payment nhi hua

        const generateSignature = crypto.
            createHmac('sha-256', process.env.RAZORPAY_SECRET)//secret key ka base par humne ek signature bna liya then subscriptionId and razorpay_payment_id ke base par humne us signature ko update kar diya
            .update(`${razorpay_payment_id}|${subscriptionId}`)
            .digest('hex')
        // const generateSignature =await hmac_sha256(razorpay_subscription_id + "|" + razorpay_payment_id, process.env.RAZORPAY_SECRET);
        
        
        if (generateSignature != razorpay_signature) {

            return next(new AppError('payment not verify,please try again', 500));

        }
        // agar payment ho gya then hum ek entry create kar denge humare payment model me
        
       const payment=await paymentmodel.create({
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,

        })
       
        user.subscription.status = 'ACTIVE';
     
        await user.save(); //how user.save() saved the document in usermodel schema 
        //user is a variable jo usermodel schema se aaya hai jisme document store hai to sare mthod ispar laga asakrte hai

        //   Saves this document by inserting a new document into the database if document.isNew is true, or sends an updateOne operation only with the modifications to the database, it does not replace the whole document in the latter case.
       
        res.status(200).json({
            success: true,
            message: 'payment verified successfully'
        })


    }
    catch (err) {
        
        return new AppError(err.message, 400);

    }


}


const cancelSubscription = async (req, res, next) => {

    try {

        const { id } = req.body.user;
      
        const user = await usermodel.findById(id);
       
        if (!user) {
            return next(new AppError('unauthorized,please logoin', 400));

        }
        if (user.role == 'ADMIN') {

            return next(new AppError('admin cannot puchase subscription', 400));
        }

        const subscriptionId = user.subscription.id;

        //it will unsubscribe the subscription of user
        // const fetch=await razorpay.subscriptions.fetch(subscriptionId);
       
        const subscription = await razorpay.subscriptions.cancel(subscriptionId);

        console.log("subscription cancel object",subscription);

        user.subscription.status = 'INACTIVE';
        await user.save();
      
        res.status(200).json({
            success: true,
            message: 'user are unsubscribe'

        })
      
    }
    catch (err) {

        return next(new AppError(err.message, 400));

    }

}

const allPayments = async (req, res, next) => {
    try {
console.log("start");
        //ab humko sara data nhi nikalna query param me se kuch count bhejenge utna hi data nikalna hai

        const { count } = req.query;
console.log("count",count);
        const payment = await razorpay.subscriptions.all({
            count: count || 10,//subscription is unique in razorPay so isme agar user ne count diya hai to utne subscription dedega otherwise 10 subscription dega

        });
        console.log("paymen",payment);
        const respon= await paymentmodel.find({});
      
      console.log("respon",respon);
        const monthlySalesRecord=[0,0,0,0,0,0,0,0,0,0,0,0];
        respon.map((el)=>{
            const createdAtDate=new Date(el.createdAt);
          
            const year=createdAtDate.getFullYear();
         
            let temp;
            const currentDate=new Date().getFullYear();

            if(year==currentDate){

                 temp=createdAtDate.getMonth();
                 monthlySalesRecord[temp]+=499;
            }
            
        })
  console.log("monthlySalesRecord",monthlySalesRecord);




        return res.status(200).json({
            success: true,
            message: 'all payments',
            payment,
            monthlySalesRecord
        })

    }
    catch (err) {
        return next(new AppError(err.message, 400));

    }


}
export { getRazorPayKey, getSubscription, verify, cancelSubscription, allPayments };
