import dotenv from "dotenv";

import mongoose from "mongoose";
import connectDB from "./db/index.js";


dotenv.config();
connectDB();

// import express from "express";

// const app = express()
// ;( async () => {
//     try {
//        await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);

//        app.on("error", (error)=> {
//         console.log("Error: ", error);
//         
//        })

//        app.listen(process.env.PORT , () => {
//         console.log(`App is listing on : ${process.env.PORT}` )
//        })
//     } catch (error) {
//         console.log('Error while connecting to database', error);
//     }
// } )()