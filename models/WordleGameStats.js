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

},{
    collection: 'WordleStats',
})

module.exports = mongoose.model('WordleStats', WordleStatsSchema);