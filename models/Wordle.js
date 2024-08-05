const mongoose = require('mongoose');
const { Schema } = mongoose;

//create schema object

const wordleSchema = new Schema ({
    username:{
        type:String,
    },
    useremail:{
        type:String,
    },
    wordlescore:{
        type:String,
    }
},{
    collection: 'Wordle',
    timestamps: true 
})

module.exports = mongoose.model('Wordle', wordleSchema)