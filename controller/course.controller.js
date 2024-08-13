import coursemodel from "../model/course.schema.js";
import AppError from "../utils/error.utils.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import path from "path";
import usermodel from "../model/user.schema.js";

const getAllCourses = async (req, res, next) => {
  //yahan par humko sirf course chahiye uske andar ke lecture nhi select('-lectures') karne se lecture nhi dega
  try {
    const courses = await coursemodel.find({}).select("-lectures");

    return res.status(200).json({
      success: true,
      message: "All courses",
      courses,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};
const getLecturesOfCourses = async (req, res, next) => {
  try {
    const id = req.params.id;

    const alllectures = await coursemodel.findById(id);

    if (!alllectures) {
      return next(new AppError("course of this id not found", 400));
    }

    return res.status(200).json({
      success: true,
      message: "course lecture",
      lecture: alllectures.lectures,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};

const createCourses = async (req, res, next) => {
  // couse create karte waqt main form data me sari information dunga about course
  try {
    const { title, description, category, createdBy } = req.body;
    if (!title || !description || !category || !createdBy) {
      return next(new AppError("All field are mandatory", 400));
    }

    const course = await coursemodel.create({
      title,
      description,
      category,
      createdBy,
      thumbnail: {
        secure_url: "http://localhost",
        public_id: "dhewd",
      },
    });

    if (!course) {
      return next(new AppError("course could not be created", 400));
    }

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "LMS",
          height: 250,
          width: 250,
        });
        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`);
      } catch (err) {
        return next(new AppError(err.message, 400));
      }
    }
    await course.save();

    return res.status(200).json({
      success: true,
      message: "course has been created",
      course,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await coursemodel.findByIdAndUpdate(
      id,
      {
        $set: req.body, //id ke base pe find karke req.body me jo property update kari hongi sirf un proprty ko update kar dega
      },
      {
        runValidators: true, //yeh check karta hai ki jo nya data aa rha hai woh shi hai ya nhi h jo mongo ka structure aaega uske through yeh pass karne ki koshish karega
      }
    );
    if (!course) {
      return next(new AppError("course of given id is not exist", 400));
    }

    return res.status(200).json({
      success: true,
      message: "course updated successfully",
      course,
    });
  } catch (err) {
    return next(new AppError(err.message, 403));
  }
};
const removeCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    const course = await coursemodel.findByIdAndDelete(id);
    //or first find and then delete the course ;
    console.log("course cotroller ", course);
    if (!course) {
      return next(new AppError("course of this id is not exist", 400));
    }
    return res.status(200).json({
      success: true,
      message: "course deleted successfully",
      course,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};
const addLectureById = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;
    if (!title || !description) {
      return next(new AppError("All feild mandaoty in a lecture", 400));
    }

    const course = await coursemodel.findById(id);
    if (!course) {
      return next(new AppError("course not exist of this id", 400));
    }
    const lectureData = {
      title,
      description,
      lecture: {
        public_id: "uysgyu",
        secure_url: "fasty",
      },
    };

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "LMS",
          chunk_size: 50000000, //50mb tak daal sakte hain
          resource_type: "video",
        });

        if (result) {
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`);
      } catch (err) {
        for (const file of await fs.readFile("uploads/")) {
          await fs.unlink(path.join("uploads/", file));
        }

        return next(
          new AppError(err.message || "File not uploaded,please try again", 400)
        );
      }
    }

    course.lectures.push(lectureData);
    course.numberOfLectures = course.lectures.length;
    await course.save();
    res.status(200).json({
      success: true,
      message: "lecture added",
      course,
    });
  } catch (err) {
    return next(new AppError(err.message, 400));
  }
};
const removeLectureFromCourses = async (req, res, next) => {
  try {
    const { courseId, lectureId } = req.query;

    if (!courseId) {
      return new AppError("courseId is required", 400);
    }
    if (!lectureId) {
      return new AppError("lectureId is required", 400);
    }

    let course = await coursemodel.findById(courseId);
    if (!course) {
      return new AppError("course not exist or invalid id", 400);
    }

    const Arr = course.lectures.map((element, idx) => {
      if (element._id == lectureId) {
        return idx;
      }
    });
    console.log("Arr", Arr);
    const index = Arr[1];
    let arr = course.lectures;

    arr.splice(index, 1);

    course.lectures = arr;

    course.numberOfLectures = course.numberOfLectures - 1;

    // Decrement the number of lectures
    await course.save();

    return res.status(200).json({
      success: true,
      message: "lecture deleted",
      lectures: arr,
    });
  } catch (err) {
    return new AppError(err.message, 400);
  }
};
export {
  getAllCourses,
  getLecturesOfCourses,
  createCourses,
  updateCourse,
  removeCourse,
  addLectureById,
  removeLectureFromCourses,
};
