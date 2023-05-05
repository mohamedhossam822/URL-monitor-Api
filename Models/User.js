const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true,"Email is required"],
        unique: true,
        lowercase: true,
        validate: {
            validator: function(v) {
              return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(v);
            },
            message: props => `${props.value} is not a email!`
          },
    },
    password: {
        type: String,
        required: [true,"A password is requird is required"],
        minLength: [8,"Password must be at least 8 characters long"]
    },
    verified : {
        type: Boolean,
        default: false
    }
  });
  
  mongoose.model("User", userSchema);