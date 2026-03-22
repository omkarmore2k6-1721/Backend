import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import uploadToCloudinary from "../utils/cloudinary.js";
import { response } from "express";
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
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


const loginUser = asyncHandler(async (req, res) => {
    //req body 
    // username or email
    // find the user
    //match the password
    //access the refresh and access token
    // send the cookie

    const {email , username, password} = req.body;

    if(!(username || email))
        throw new ApiError(400,"username or email is required")

    const user = await  User.findOne({
        $or: [{username}, {email}]
    })

    if(!user) {
        throw new ApiError(404 , "User not found");
    }

    // the User can access only inbuild methods of the mongoose
    // to obtain user define methods we use user
    // user has decleared above and has instance of User model

    const isPasswordMatching = await user.comparePassword(password);

    if(!isPasswordMatching){
        throw new ApiError(404, "Password is not correct")
    }
    
     const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

     const loggedUser = await User.findById(user._id).select("-password -refreshToken")

      const options = {
        httpOnly: true,// these are for security concern such that no one from frontend can edit it
        secure: true
    }


     return res
     .status(200)
     .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken, options)// this is method in res 
     .json(
        new ApiResponse(
            200,
            {
                user: loggedUser, accessToken,refreshToken
            },
            "user Logged in successfully"
        )
     )
})  


 const generateAccessAndRefreshToken = async (userId) => {
    try{

        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validationBeforeSave: false })

        return {accessToken, refreshToken}

    }catch(error){

        throw new ApiError(500 , "Something went wrong while generating Token")
        
    }
}


const logoutUser = asyncHandler(async(req,res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken" , options)
    .json(
        new ApiResponse(200, {}, "userLogged Out")
    )
})


const AccessAndRefreshTokens = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // IMPORTANT: Check token matches DB token
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});


const ChangePassword = asyncHandler( async (req,res) => {
    const {oldPassword,newPassword,confirmPassword} = req.body;

    if(newPassword !== confirmPassword){
        throw new ApiError(401, " new Password is incorrect")
    }

    const user = await User.findById(req.user._id);

    user.password = newPassword;
    await user.save({validationBeforeSave: false})
})

const EditAccount = asyncHandler(async (req,res) => {
    const {email, username} = req.body;

    if(!username || !email){
        throw new ApiError(401, "Invalid username and Password");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                email: email,
                username: username
            }
        },

    ).select("-password");

    return res
    .status(201)
    .json(new ApiResponse(201, user, "Profile Updated successfully"))



})

const UpdateAvtar = asyncHandler( async (req,res)=> {
    const {avtarurl} = req.file?.path;

    if(!avtarurl){
        throw new ApiError(401, "Wrong  avtar file");
    }

    const response = await User.uploadToCloudinary(avtarurl);

    if(!response.url){
        throw new ApiError(501, "SOmething went wrong while updating the Avtar file")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                avtar: response.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Avtar updated"))
})

const UpdatecoverImage = asyncHandler( async (req,res)=> {
    const {coverImage} = req.file?.path;

    if(!coverImage){
        throw new ApiError(401, "Wrong  coverImage file");
    }

    const response = await User.uploadToCloudinary(coverImage);

    if(!response.url){
        throw new ApiError(501, "SOmething went wrong while updating the coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: {
                avtar: response.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage updated"))
})


export { registerUser , loginUser,
    generateAccessAndRefreshToken , logoutUser ,
     AccessAndRefreshTokens , EditAccount , ChangePassword};



    // => logout
    // 1. take token from req
    //2. verify token
    //3. remove refreshtoken
    //4. set req.user = updated user
    // 5 undefine the refreshtoken in db
    // clear the cookies