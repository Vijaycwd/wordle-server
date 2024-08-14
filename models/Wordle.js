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
    guessdistribution: {
        type: [Number], // Array of numbers representing guess distribution
        default: [0, 0, 0, 0, 0, 0], // Default value for 6 guesses
    },
    isWin:{
        type:String,
    }
},{
    collection: 'Wordle',
    timestamps: true 
})

module.exports = mongoose.model('Wordle', wordleSchema)