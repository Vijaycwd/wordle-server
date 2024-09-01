const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary

router.route('/wordle-score').post(async (req, res) => {
    console.log(req.body);
    const { username, useremail, wordlescore, guessDistribution, isWin, createdAt } = req.body;

    try {
        // Create Date objects from the user's local time (createdAt)
        const userDate = new Date(createdAt);
        const timezoneOffset = userDate.getTimezoneOffset();
        // Set start and end of day based on the user's local time
        const startOfDay = new Date(userDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(userDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Convert to UTC to align with server time
        const startOfDayUTC = new Date(startOfDay.getTime() - (timezoneOffset * 60000));
        const endOfDayUTC = new Date(endOfDay.getTime() - (timezoneOffset * 60000));

        // Check if a score already exists for the given email on the same day
        const existingScore = await wordleSchema.findOne({
            useremail: useremail,
            createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC }
        });
    

        if (existingScore) {
            const now = new Date();
            const hoursRemaining = Math.floor((endOfDay - now) / 1000 / 60 / 60);
            const minutesRemaining = Math.floor((endOfDay - now) / 1000 / 60) % 60;

            return res.status(409).json({
                message: `Today's score has already been added. Play again in ${hoursRemaining} hours and ${minutesRemaining} minutes!`
            });
        }

        // Create and save the new Wordle score with guess distribution
        const wordleScoreObject = new wordleSchema({
            username,
            useremail,
            wordlescore,
            guessDistribution,
            isWin,
            createdAt: userDate // Save the user's local time as the creation time
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