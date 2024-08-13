
import express from "express";
import isloggedin from "../middleware/auth.middleware.js"
import { getAllCourses,getLecturesOfCourses,createCourses,updateCourse,removeCourse,addLectureById,removeLectureFromCourses} from "../controller/course.controller.js";
import upload from "../middleware/multer.middleware.js";
import authorization from "../middleware/authorization.middleware.js";
import {authorizedsubscriber} from "../middleware/authirizedsubscriber.middleware.js";

const router= express.Router();

//getAllCourses it gives all cources
// router.get('/',getAllCourses);
router.route('/')
.get(getAllCourses)
.post(upload.single('thumbnail'),//Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.
isloggedin,authorization('ADMIN'),createCourses)//course create karte waqt main form data me sari information dunga about course
.delete(isloggedin,authorization('ADMIN'),removeLectureFromCourses)        //line 8 and 9 expression are same but is tarah likhne par hum aur method ke liye bhi isko apply kar sakte  hai router.route('/').get(getAllCourses).post(getAllCourses); ab get and post donon method ke liye chalega
//'/' url pe koi bhi post request ke sath hit karta hai the createCourse function chalega

//getLecturesOfCourses it gives all lecture of particular id course
// router.get('/:id',getLecturesOfCourses);
router.route('/:id')
.get(isloggedin,authorizedsubscriber,getLecturesOfCourses)
.put(isloggedin,authorization('ADMIN'),updateCourse)
//authorization('ADMIN') KI MAIN SIRF ADMIN KO YAHAN ALLOW KARNE WALA HOON
.delete(isloggedin,authorization('ADMIN'),removeCourse)
.post(isloggedin,authorization('ADMIN'),upload.single('lecture'),addLectureById);//jab main update and delete kar rha hoonga course ko to jis course ko update kar rhe hain uske liye course id chahiye ki kis course ko update kar rhe hain;
//  if we are loggedin user then only we can see the course detail
// '/:id' url pe koi bhi put request ke sath hit karta hai the updateCourse function chalega
// '/:id' url pe koi bhi delete request ke sath hit karta hai the removeCourse function chalega
// post request particular course id pe (isloggedin,authorization('ADMIN'),addLectureById) par
// lecture ko add kar degi  



export default router;