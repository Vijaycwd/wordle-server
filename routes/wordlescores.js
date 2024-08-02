const mongoose = require('mongoose');
const express = require('express');
router = express.Router();

let wordleSchema = require('../models/Wordle');

function isToday(dateString) {
  const givenDate = new Date(dateString);
  const today = new Date();
  // Normalize both dates to midnight to avoid time comparison issues
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfGivenDate = new Date(givenDate.getFullYear(), givenDate.getMonth(), givenDate.getDate());

  return startOfToday.getTime() === startOfGivenDate.getTime();
}

router.route('/wordle-score').post(async (req,res) => {
    const { username, useremail, wordlescore, createdAt } = req.body;
    const checkToday = isToday(createdAt);

    if(!checkToday){
      console.log('Today data inserted sucessfully!');
      try {
        wordleSchema.create(req.body)
        .then(scores => res.json(scores))
        .catch(err => res.json(err))
      } catch (error) {
        
      }
    }
    else{
      return res.status(409).json({ message: 'Entry with the same date already exists', data: req.body });
    }
})

router.route('/').get((req,res) =>{
    wordleSchema.find()
    .then(scores => res.json(scores))
    .catch(err => res.status(400).json("Erro: "+ err)) 
  })

module.exports = router