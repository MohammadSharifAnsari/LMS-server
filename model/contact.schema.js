
import mongoose from "mongoose";



const contactSchema=mongoose.Schema({

    name:{
        type:String,
        required:[true,'name is mandatory'],
        lowercase:true
    },
    email:{
        type:String,
        trim:true,
        required:[true,'email is required'],
        unqiue:true,
        match:[/^(?:(?:[\w`~!#$%^&*\-=+;:{}'|,?\/]+(?:(?:\.(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)*"|[\w`~!#$%^&*\-=+;:{}'|,?\/]+))*\.[\w`~!#$%^&*\-=+;:{}'|,?\/]+)?)|(?:"(?:\\?[\w`~!#$%^&*\-=+;:{}'|,?\/\.()<>\[\] @]|\\"|\\\\)+"))@(?:[a-zA-Z\d\-]+(?:\.[a-zA-Z\d\-]+)*|\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\])$/gim,'please set avalid email']
        //we give regular expression to match the email
    },
    message: {
        type: String,
        required: [true,"please tell me about your problem in message section"]
      },

},{
    timestamps:true
})

export default mongoose.model("contact",contactSchema);// database me contact-> contacts ho jaega