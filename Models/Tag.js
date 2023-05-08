import mongoose from 'mongoose';
const tagSchema = new mongoose.Schema({
    name:{
      type:String,
      required:[true,"A name for the tag is required"]
    },
    user:{
      //populate('User')
      type: mongoose.ObjectId,
      ref: "User",
    },
    urlChecks: [{
      //populate('urlChecks')
      type: mongoose.ObjectId,
      ref: "UrlCheck",
    }],

  });
  
  mongoose.model("Tag", tagSchema);