import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avtar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

    //.fields Upload multiple files with different field names
    ///upload.single("page" , 5) uplaod file  with same name multiple times
    //upload.single("phot") upload single file
    // req look like below after the uploading
//     req.files = {
//   avtar: [ fileObject ],
//   coverImage: [ fileObject ]
//}
    // const avtar = req.files.avtar[0];  this how we can access it
//serRouter.post("/register", registerUser);
export default userRouter;