import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';   

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    Credentials: true
}));

app.use(express.json({limit: "64kb"}));

// this means it takes data from url.
app.use(express.urlencoded({extended: true, limit: "64kb"}));

app.use(express.static("public"));
app.use(cookieParser());


// routes imported

import userRouter from './routes/user.route.js';

app.use("/users" , userRouter)

//http://localhost:8000/api/v1/users/register


export default app;