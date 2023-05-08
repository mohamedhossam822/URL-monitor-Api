import mongoose from 'mongoose';
const urlCheckSchema = new mongoose.Schema({
    name: 
    {
      type: String,
      trim: true,
      required:[true,"A Name for the URL Check is required"]
    },
    url:{
      type: String,
      trim: true,
      required:[true,"A Valid URL is required"]
    },
    protocol:{
      type: String,
      trim: true,
      required:[true,"A Protocol is required"],
      enum: {
        values: ['HTTP', 'HTTPS','TCP'],
        message: '{VALUE} is not supported, Use HTTP or HTTPS or TCP'
      }
    },
    path: String,
    port: Number,
    webhook: String,
    timeout : {type: Number,default: 5},
    interval :{type: Number,default: 10},
    threshold : {type: Number,default: 1},
    authentication: {
      username: String,
      password: String
    },
    httpHeaders: [{key:String,value:String}],
    assert:{statusCode: Number},
    tags: [],
    ignoreSSL: {
      type: Boolean,
      validate: {
        validator: function(v) {
          return this.protocol !== 'HTTPS' || v === false || v==true;
        },
        message: props => `${props.value} is not a email!`
      },
    },
    user:{
      //populate('user')
      type: mongoose.ObjectId,
      ref: "User"
    },
    status: {type: Boolean, default: true},
    outages: {type:Number, default: 0},
    downtime: {type:Number, default: 0},
    upTime: {type:Number, default: 0},
    avgResponseTime: {type:Number, default: 0},
    totalPings:{type: Number, default: 0},
    history: [],
    lastTimeStampMs: {type:Number ,default: Date.now()},
    availability: {type:String,default:""}
  });
  
  mongoose.model("UrlCheck", urlCheckSchema);