
import mongoose from "mongoose"

const courseSchema=new mongoose.Schema({

    title:{
        type:String,
        required:[true,'title is required'],
        minLength:[4,'title must be atleast 4 character'],
        maxLength:[50,'title must less then 50 character'],
        trim:true
    },
    description:{
        type:String,
        required:[true,'title is required'],
        minLength:[4,'title must be atleast 4 character'],
        maxLength:[200,'title must less then 50 character'],
        trim:true
    },
    category:{
        type:String,
        required:[true,'category feild is required'],

    },
thumbnail:{
    public_id:{
        type:String,
        required:[true,'public_id is required in thumbnail']
    },
    secure_url:{
        type:String,
        required:[true,'secure_url is required in thumbnail']
    }
},

    //lectures means har course me bahut sare lecture honge un sabhi lecture ki list
    lectures:[
        {
            
            title:String,
            description:String,
            //lecture me hum ek lecture ki public_id and secure_url daal rhe hain isme image bhi store kara sakte hain 
            lecture:{
                public_id:{
                    type:String,
                    required:[true,'public_id is required in lectures']

                },
                secure_url:{
                    type:String,
                    required:[true,'secure_url is required in lectures']
                }
            }

        }
    ],
    numberOfLectures:{
        type:Number,
        default:0//default value of lectures is zero
    },
    createdBy:{
        type:String,
        required:[true,'author name is required']
    }
    


},{
    timestamps:true
})


export default mongoose.model('course',courseSchema);

