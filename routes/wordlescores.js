const mongoose = require('mongoose');
const express = require('express');
router = express.Router();

let wordleSchema = require('../models/Wordle');

router.route('/wordle-score').post(async (req,res) => {
    //console.log(req.body);
    try {
         wordleSchema.create(req.body)
         .then(scores => res.json(scores))
         .catch(err => res.json(err))
     } catch (error) {
       
     }
})

router.route('/').get((req,res) =>{
    wordleSchema.find()
    .then(scores => res.json(scores))
    .catch(err => res.status(400).json("Erro: "+ err)) 
  })

module.exports = router