import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

app.on("error", (error) => {
    console.error("Server error:", error);
    throw error;
});

dotenv.config({});
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`App is listing on : ${process.env.PORT || 8000}` )
    })
})
.catch((error) => {
    console.log("Error while connecting to database !!!", error);
})

 
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