const mongoose = require('mongoose');
const { Schema } = mongoose;

//create schema object

const WordleStatsSchema  = new Schema ({
    username:{
        type:String,
    },
    useremail:{
        type:String,
    },
    totalGamesPlayed:{
        type:Number,
        default: 0
    },
    totalWinGames:{
        type:Number,
        default: 0
    },
    lastgameisWin:{
        type:String,
    },
    currentStreak: {
        type: Number,
        default: 0,
    },
    maxStreak: {
        type: Number,
        default: 0,
    },
    guessDistribution: {
        type: [Number], // Array of numbers representing guess distribution
        default: [0, 0, 0, 0, 0, 0], // Default value for 6 guesses
    },
    handleHighlight:{
        type: [Number],
        default: [0],
    },


},{
    collection: 'WordleStats',
})

module.exports = mongoose.model('WordleStats', WordleStatsSchema);