const mongoose = require('mongoose');
const { Schema } = mongoose;

//create schema object

const filesSchema = new Schema ({
    filename:{
        type:String,
        required: true,
    }
},{
    collection: 'Files'
})

module.exports = mongoose.model('Files',filesSchema);