const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary

router.route('/wordle-score').post(async (req, res) => {
  const { username, useremail, wordlescore } = req.body;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  try {
    console.log(`Checking scores for email: ${useremail} between ${startOfDay} and ${endOfDay}`);

    const existingScore = await wordleSchema.findOne({
        useremail:useremail,
        createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    if (existingScore) {
        const now = new Date();
        const hoursRemaining = Math.floor((endOfDay - now) / 1000 / 60 / 60);
        const minutesRemaining = Math.floor((endOfDay - now) / 1000 / 60) % 60;

        return res.status(409).json({
            message: `Today's score is already added. Please try playing the game after ${hoursRemaining} hours and ${minutesRemaining} minutes.`
        });
    }

    const wordleScoreObject = new Wordle({
        username,
        useremail,
        wordlescore
    });

    const newScore = await wordleScoreObject.save();
    res.status(201).json(newScore);

    } catch (error) {
        console.error("Error saving score: ", error);
        res.status(500).json({ message: 'Error saving score.', error });
    }
});

router.route('/').get((req,res) =>{
    wordleSchema.find()
    .then(scores => res.json(scores))
    .catch(err => res.status(400).json("Erro: "+ err)) 
  })

// router.get('/', async (req, res) => {
//   const { userEmail } = req.query;
//   // console.log(userEmail);
//   if (!userEmail) {
//       return res.status(400).json({ message: "UserEmail is required" });
//   }
  
//   const startOfDay = new Date();
//   startOfDay.setHours(0, 0, 0, 0);

//   const endOfDay = new Date();
//   endOfDay.setHours(23, 59, 59, 999);
//   console.log(req);
//   try {
//       const results = await wordleSchema.find({
//           createdAt: { $gte: startOfDay, $lt: endOfDay }
//       });
//       res.json(results);
//   } catch (error) {
//       res.status(500).json({ message: "Server error" });
//   }
// });

module.exports = router