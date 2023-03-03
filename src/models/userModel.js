
const mongoose = require("mongoose")

//----------------------------------------Creating Schema---------------------------------------------


const userSchema = new mongoose.Schema({


    fname: {
        type: String,
        required: true,
    },

    lname: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
   
    phone: {
        type: Number,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
    // hashed password
    address: {
        type: String,
        required: true

    },

},
    { timestamps: true });

//---------------------------------- exporting  the model here--------------------------------------

module.exports = mongoose.model("User", userSchema);