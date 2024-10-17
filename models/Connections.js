const mongoose = require('mongoose');
const { Schema } = mongoose;

//create schema object

const connectionsSchema = new Schema ({
    username:{
        type:String,
    },
    useremail:{
        type:String,
    },
    connectionsscore:{
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
    collection: 'Connections',
    timestamps: true 
})

module.exports = mongoose.model('Connections', connectionsSchema)