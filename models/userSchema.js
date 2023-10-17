const mongoose=require("mongoose")
const passportLocalMongoose = require('passport-local-mongoose');
const { link } = require("../routes");

const userSchema=new mongoose.Schema({
    name:String,
    email:String,
    username:String,
    password:String,
    address:String,
    mobile:String,
    DOB:String,
    language:String,
    hobbie:String,
    Linkdin:String,
    Github:String,
    degree:String,
    college:String,
    year:String,
    position:String,
    desciption:String,
    duration:String,
    objective:String,
    title:String,
    tecnology:String,
    projectDesc:String,
    skill:String,
    avatar: {
        type: String,
        default: "dummy.png",
    },
    
},
{ timestamps: true }
)


userSchema.plugin(passportLocalMongoose)
const user=mongoose.model("user",userSchema)
module.exports=user
