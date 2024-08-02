
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
//create tokem
const jwt = require('jsonwebtoken');

var nodemailer = require('nodemailer');


router = express.Router();

//import Model

let filesSchema = require('../models/Files');

router.route('/uploads').post(async (req,res)=> {
    console.log(res.data);
    try {
        const newImage = await filesSchema.create(res.body);
        if(newImage){
            res.status(200).json({ message: 'File Upload Successfully' });
        }
    } catch (error) {
        res.status(200).json({ message: 'File Not Upload'});
    }
});
module.exports = router
