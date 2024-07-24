const mongoose = require('mongoose');
const { Schema } = mongoose;

//create schema object

const wordleSchema = new Schema ({
    name:{
        type:String,
    },
    wordlescore:{
        type:String,
    },
},{
    collection: 'Wordle'
})

module.exports = mongoose.model('wordle', wordleSchema)