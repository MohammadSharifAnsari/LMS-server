
import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import userroutes from "./routes/user.routes.js";
import courseroutes from "./routes/course.routes.js"
import errorMiddleware  from "./middleware/error.middleware.js";
import paymentRoutes from "./routes/payment.routes.js";
import miscellaneous from "./routes/miscellaneous.routes.js"
import adminRoutes from "./routes/Admin.routes.js"
import dotenv from 'dotenv/config';
import morgan from "morgan";

const app=express();



// these are middelware
//morgan middleware basically console me woh url daalegi jis url se server par request jaegi
app.use(morgan('dev'));//dev nhi karte to puri information with day time and computer version deta dev use karne se sirf aadhi information de rha hai means only about request
app.use(express.json());
app.use(express.urlencoded({extended:true}));//work for post in html form
//encoded url se query params ko nikalne ke liye hum isko use kar sakte hai
app.use(cors({
origin:[process.env.FRONTEND_URL1,process.env.FRONTEND_URL2,process.env.FRONTEND_URL3],
credentials:true//cookie set ho jaegi

}));


app.use(cookieparser());
//parse the cookie into object like this
// cookies: {
//     token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0Y2FhNGIzMjllZjM1NDY2MzQzZjI2ZiIsIm5hbWUiOiJtb2hhbW1hZCBzaGFyaWYgYW5zYXJpIiwiZW1haWwiOiJtb2hhbW1hZHNoYXJpZmFuc2FyaTE1N0BnbWFpbC5jb20iLCJzdWJzY3JpcHRpb24iOnt9LCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MDk3NDc3MjEsImV4cCI6MTcwOTgzNDEyMX0.QlPDEsl3lWwRl4Hd45SJVRwynKHgNKE1cns-wJ7hNK4'    
//   }

//alluser related routes is route me run karenge
//humne controller me error ko next kar diya hai now if error come then line 27 ke aage error pass ho jaegi
app.use('/api/v1/user',userroutes);
app.use('/api/v1/course',courseroutes);
app.use('/api/v1/payment',paymentRoutes);
app.use('/api/v1/miscellaneous',miscellaneous);
app.use('/api/v1/admin',adminRoutes);


//this is api we make for check that our serever is up or not
app.use('/ping',(req,res)=>{

res.send('pong');

})

//app.all('*',callback)=> yeh keh rha hai kisi bhi route pe request jae jo upar define nhi hai then yeh walaa callback return kardo
// app.all('*',(req,res)=>{

    
// res.status(400).send("404 -page not found");

// })
app.get("/",(req,res)=>{
    res.status(200).json("Server runnning");
})

//yeh middle ware error object ko user ko pass karegi as a responce
// yeh last me likha hai means  agar humara yeh wala (52) code encounter hua hai then humne kuch gadbadi ki hai tabhi yahan tak code aaya hai warna pehle hi responce chala jata
app.use(errorMiddleware);

// app.use('/',router) ;

export default app;
