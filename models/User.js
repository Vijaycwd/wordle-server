const mongoose = require('mongoose');
const { Schema } = mongoose;

//create schema object

const userSchema = new Schema ({
    username:{
        type:String,
        required: true,
    },
    email:{
        type:String,
        required: true,
    },
    password:{
        type:String,
        required: true,
    },
    avatar:{
        type:String
    }
},{
    collection: 'Users'
})

module.exports = mongoose.model('User',userSchema);