const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const mongoose = require('mongoose');

//create tokem
const jwt = require('jsonwebtoken');

var nodemailer = require('nodemailer');


router = express.Router();

//import Model

let userSchema = require('../models/User');

//put endpoint 
//localhost:3000/create-user
//post user

//Register User
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "public/uploads")
  },
  filename: function (req, file, cb) {
    return cb(null, `${file.originalname}`)
  }
})

const upload = multer({ storage: storage });

router.route('/create-user').post(upload.single('avatar'), async (req,res)=> {
 const baseUrl = `${req.protocol}/public/uploads/uploads/`;
 const fileUrl = `${baseUrl}${req.file.originalname}`;
 console.log('Baseurl', baseUrl);
  try {
    var emailExist = await userSchema.findOne({email:req.body.email});
    if(emailExist){
      return res.status(400).json("Email Already Exist");
    }
    else{
     
      var hash = await bcrypt.hash(req.body.password, 10);
      
      const userObject = {
        username: req.body.username,
        email: req.body.email,
        password: hash,
        avatar: fileUrl
      }
      console.log(userObject);
      userSchema.create(userObject)
      .then(users => res.json(users))
      .catch(err => res.json(err))
    }
    /*userSchema.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))*/
  } catch (error) {
    res.status(400).json(error);
  }
})


//get user list
router.route('/').get((req,res) =>{
  userSchema.find()
  .then(users => res.json(users))
  .catch(err => res.status(400).json("Erro: "+ err)) 
})

//login User
router.route('/login').post(async (req,res)=> {
  try {
    const userData = await userSchema.findOne({email:req.body.email});
    if(!userData){
      return res.status(400).json("Email Not exist");
    }
    else{
      const validPwd = await bcrypt.compare(req.body.password,userData.password);
      if(!validPwd){
        return res.status(400).json("Password invalid");
      }
      else{
        const userToken = await jwt.sign({email:userData.email},'coralWeb');
        res.header('auth', userToken).send(userData);
      }
    }
  } catch (error) {
    return res.status(400).json("Invalid User");
  }

})
//get user list
const validUser = (req,res,next) =>{
  const token = req.header('auth');
  res.token = token;
  next();
}
router.route('/getuser').get(validUser, async (req,res) =>{
  jwt.verify(res.token,'coralWeb', async (err,data)=>{
    if(err){
      res.sendStatus(403);
    }
    else{
      const data = await userSchema.find().select(['-password']);
      then(user => res.json(data))
    }
  });
})

//Delete user list
//loca:500/emp
router.route('/:id').delete(async (req, res) => {
  const userId = req.params.id;
  try {
    const deleteduser = await userSchema.findByIdAndDelete(userId);
    if (!deleteduser) {
      return res.status(404).json({ message: 'user not found' });
    }

    res.status(200).json({ message: 'user deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the user' });
  }
});

router.route('/:id').put(upload.single('avatar'), async (req, res) => {
  const userId = req.params.id;
  try {
    const userData = req.body;

    // Check if the email is being updated
    if (userData.email) {
      const existingUser = await userSchema.findOne({ email: userData.email });

      // If another user already exists with the new email, prevent the update
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
    }
    // Check if the password is being updated
    if (userData.password) {
      // Hash the new password before updating
      const hash = await bcrypt.hash(userData.password, 10);
      userData.password = hash;
    }

    // Update the user with the new data
    const updatedUser = await userSchema.findByIdAndUpdate(userId, userData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while updating the user' });
  }
});


//Reset Password

router.route('/reset-password').post(async (req,res)=> {
  try {
    const userData = await userSchema.findOne({email:req.body.email});
    if(!userData){
      return res.status(400).json("User Not Found");
    }
    const userToken = await jwt.sign({email:userData.email},'coralWeb', {expiresIn:"5m"});
    const emailLink = `http://localhost:3000/reset-password/${userData._id}/${userToken}`;
    console.log(userData.email);
    console.log(userData.password);
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'vijisubramani300@gmail.com',
        pass: 'sxca qmpn rldq gygq'
      }
    });
  
    var mailOptions = {
      from: 'youremail@gmail.com',
      to: userData.email,
      subject: 'Sending Email using Node.js',
      text: emailLink
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    console.log(emailLink);

  } catch (error) {
    
  }
});

router.route('/reset-password/:id/:token').get( async (req,res) =>{
  const {id, token} = req.params;
  //console.log(req.params);

  const oldUser = await userSchema.findOne({_id: id});
  if(!oldUser){
    return res.status(400).json("User Not Found");
  }

  try {
      const verify = jwt.verify(token,'coralWeb');
      res.render("index",{email: verify.email});
      res.send("Verified");
  } catch (error) {
      res.send("NoT Verified");
  }
})

router.route('/reset-password/:id/:token').post(async (req,res)=> {
  const {id, token} = req.params;
  const {password} = req.body;
  //console.log(req.params);
  const oldUser = await userSchema.findOne({_id: id});
  if(!oldUser){
    return res.status(400).json("User Not Found");
  }
  try {
    const verify = jwt.verify(token,'coralWeb');
    if(verify){
      var hashpassword = await bcrypt.hash(password, 10);
      const updateuser = await userSchema.findByIdAndUpdate({_id: id}, {password: hashpassword});
      res.status(200).json({ message: 'user Update successfully' });
    } 
  } catch (error) {
      res.send("Not Verified");
  }
})

module.exports = router
