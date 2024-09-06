const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary

router.route('/wordle-score').post(async (req, res) => {
    // console.log(req.body);
    const { username, useremail, wordlescore, guessDistribution, isWin, createdAt, currentUserTime } = req.body;

    // Convert createdAt (time user played the game) to Date object
    const userGameDate = new Date(createdAt);
    const userCurrentDate = new Date(currentUserTime); // User's current time

    if (isNaN(userGameDate.getTime()) || isNaN(userCurrentDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date.' });
    }

    // Set start and end of the day based on the user's createdAt date
    const startOfDay = new Date(userGameDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(userGameDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // Check if a score already exists for the given email on the same day
        const existingScore = await wordleSchema.findOne({
            useremail: useremail,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });
         console.log(existingScore);
        if (existingScore) {
            // Calculate remaining time based on user's current time (not server time)
            const timeDiff = endOfDay - userCurrentDate;

            if (timeDiff > 0) {
                const hoursRemaining = Math.floor(timeDiff / 1000 / 60 / 60);
                const minutesRemaining = Math.floor(timeDiff / 1000 / 60) % 60;

                return res.status(409).json({
                    message: `Today’s score has already been added. Play again in ${hoursRemaining} hours and ${minutesRemaining} minutes!`
                });
            }
        }

        // Create and save the new Wordle score
        const wordleScoreObject = new wordleSchema({
            username,
            useremail,
            wordlescore,
            guessDistribution,
            isWin,
            createdAt: userGameDate // Save the game time
        });

        const newScore = await wordleScoreObject.save();
        res.status(201).json(newScore);

    } catch (error) {
        // Handle error in saving the score
        res.status(500).json({ message: 'Error saving score.', error });
    }
});

router.route('/').get((req,res) =>{
    wordleSchema.find()
    .then(scores => res.json(scores))
    .catch(err => res.status(400).json("Erro: "+ err)) 
  })



module.exports = router