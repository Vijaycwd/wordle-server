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
    },
    createdAt: {
        type:String,
    },
},{
    collection: 'Wordle'
})

module.exports = mongoose.model('Wordle', wordleSchema)