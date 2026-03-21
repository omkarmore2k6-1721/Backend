import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import uploadToCloudinary from "../utils/cloudinary.js";
import { response } from "express";
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
   //get user details from frontend
   // validation
   //check if user already exist: username , email
   //check for images and check for avtar
   //upload them to cloudinary
   //create user object - create entry in db
   //remove password and refresh tokens form the response => for security purpose
   // check for user creation
   //return response

   //1.
   // data can come form url and body

   const {fullname, email, username, password} = req.body;
  // console.log("Body: " , req.body);

   if(fullname === ""){
    throw new ApiError(400, "fullname is required")
   }

    if (
        [fullname, email, username, password].some(
            (field) => !field || field.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }
   
   
    const userByUsername = await User.findOne({ username });
    if (userByUsername) {
        throw new ApiError(409, "Username already exists");
    }

    const userByEmail = await User.findOne({ email });
    if (userByEmail) {
        throw new ApiError(409, "Email already exists");
    }

   const avtarLocalPath = req.files?.avtar?.[0]?.path;
  // console.log("Path: " , req.files);
  
   const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
   
   if(!avtarLocalPath){
    throw new ApiError(400, "Avatar file is required");
   }

    

   
   const avtar = await uploadToCloudinary(avtarLocalPath);
   
   const coverImage = await uploadToCloudinary(coverImageLocalPath);

   if(!avtar){
    throw new ApiError(400, "Avtar file is required")
   }


   const user = await User.create({
        fullname,
        avtar: avtar.url,
        coverImage: coverImage?.url || "",
        email: email,
        password,
        username: username.toLowerCase()
   });

   const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500, "something went wrong")
   }

  return res.status(200).json(
    new ApiResponse(200, createdUser, "User registered successfully")
);
})

 export { registerUser };