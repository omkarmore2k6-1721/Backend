
import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async () => {
    try {
        console.log("URL:", process.env.MONGODB_URL);
        const connectionInstance = await 
        mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        console.log("MONGODB connected SUCCESSFULLY !!       ",
             connectionInstance.connection.host); 
    } catch (error) {
        
        console.log("MOGODB connection error ", error);
        process.exit(1);
    }
}

export default connectDB;