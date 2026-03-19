import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate 
from "mongoose-aggregate-paginate-v2";
const videoSchema = new Schema(
    {
        videoFile: {
            type: String, // cloudinary url
            required: true
        },
        thumbnail: {
            type: String, // cloudinary url
            required: true
        },
        title: {
            type: String, // cloudinary url
            required: true
        },
        decription: {
            type: String, // cloudinary url
            required: true
        },
        duration: {
            type: String, // cloudinary url
            required: true
        },
        views: {
            type: Number,
            default: 0
        }


    } 
,{timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video" , videoSchema)