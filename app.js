
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
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OAuth2Client } from 'google-auth-library';
import userModel from "./model/user.schema.js"
import AppError from "./utils/error.utils.js";


const app=express();


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 100,//7 days ke liye cookie set hogi
  httpOnly: true,
  secure: true,
  sameSite: 'None',
  path: '/',
}
// these are middelware
//morgan middleware basically console me woh url daalegi jis url se server par request jaegi
app.use(morgan('dev'));//dev nhi karte to puri information with day time and computer version deta dev use karne se sirf aadhi information de rha hai means only about request
app.use(express.json());
app.use(express.urlencoded({extended:true}));//work for post in html form
//encoded url se query params ko nikalne ke liye hum isko use kar sakte hai
app.use(cors({
origin:[process.env.FRONTEND_URL3,process.env.FRONTEND_URL1],
credentials:true//cookie set ho jaegi

}));
// app.use(cookieParser());

app.use(cookieparser());

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:`${process.env.SERVER_URL}/auth/google/callback`,
    passReqToCallback: true
  },
  async function(req,accessToken, refreshToken, params , profile, done) {
    try {

      

      const idToken = params.id_token;
      console.log("ID Token:", idToken);
      const userGoogleId= profile.id;

      let user = await userModel.findOne({ googleId: userGoogleId });


      if(!user){

       
        const name=profile.displayName
        const email=profile.emails[0].value
        const photo=profile.photos[0].value
        const googleId=profile.id
       
        const user = await userModel.create({
          name,
          email,
          password:accessToken,
          googleId,
          avatar: {
              public_id: email,
              //secure_url me usne cloudinary service ka url diya hai jo image store kar rha tha
              secure_url: 'https://tse2.mm.bing.net/th?id=OIP.rBroxJeka0Jj81uw9g2PwAHaHa&pid=Api&P=0&h=220'
          }
      });

      if (!user) {
        return done(error, null);
    }

    await user.save();

    return  done(null, profile);


      }
      else{
       // If you need id_token, you may need to retrieve it from the OAuth flow


        const ticket = await client.verifyIdToken({
          idToken, // Here is the step where you replace with the ID Token from Google's response
          audience: process.env.GOOGLE_CLIENT_ID,
        });
     
        const payload = ticket.getPayload();
  
     
        const googleUserId = payload.sub;
  
        if(googleUserId!==user.googleId){

return done(error, null);

        }
  
  
        return done(null, profile); 

      }


    } catch (error) {
      console.error("Token verification failed:", error);
      return done(error, null);
    }

  }));
  

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  console.log("before auth google")
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email','openid'] }));
 

app.get('/auth/google/callback', passport.authenticate('google', {
  
  failureRedirect:`${process.env.FRONTEND_URL1}/err`
}),
async (req,res)=>{

try {

  console.log("req",req);
  console.log("request==>",req.user.id);


  let user = await userModel.findOne({ googleId: req.user.id});

  const token = await user.generateJWTToken();// we generate token at schema level

console.log("token in google>>",token);

  res.cookie('token', token, cookieOptions);
  res.cookie('MYSECRET',"true",{
    maxAge: 7 * 24 * 60 * 60 * 100,//7 days ke liye cookie set hogi
    secure: true,
    sameSite: 'None',
    path: '/',
  });

res.redirect(process.env.FRONTEND_URL1)
  
} catch (err) {
  res.redirect(`${process.env.FRONTEND_URL1}/error`);
  
}


}

);



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
app.get('/cookie', (req, res) => {
    // Access cookies
    console.log(req.cookies); // This should now log your cookies
    res.send('Cookie received');
});

//yeh middle ware error object ko user ko pass karegi as a responce
// yeh last me likha hai means  agar humara yeh wala (52) code encounter hua hai then humne kuch gadbadi ki hai tabhi yahan tak code aaya hai warna pehle hi responce chala jata
app.use(errorMiddleware);

// app.use('/',router) ;

export default app;
