const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary

router.route('/wordle-score').post(async (req, res) => {
    console.log(req.body);
    const { username, useremail, wordlescore, guessDistribution, isWin, createdAt } = req.body;

    try {
        // Convert the user's local time (createdAt) to a Date object
        const userDate = new Date(createdAt);
        const timezoneOffset = userDate.getTimezoneOffset();

        // Convert the user date to UTC
        const createdAtUTC = new Date(userDate.getTime() - (timezoneOffset * 60000));

        // Set start and end of day in UTC based on the user's local time
        const startOfDayUTC = new Date(createdAtUTC);
        startOfDayUTC.setUTCHours(0, 0, 0, 0);

        const endOfDayUTC = new Date(createdAtUTC);
        endOfDayUTC.setUTCHours(23, 59, 59, 999);

        // Check if a score already exists for the given email on the same day
        const existingScore = await wordleSchema.findOne({
            useremail: useremail,
            createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC }
        });

        if (existingScore) {
            const now = new Date();
            const hoursRemaining = Math.floor((endOfDayUTC - now) / 1000 / 60 / 60);
            const minutesRemaining = Math.floor((endOfDayUTC - now) / 1000 / 60) % 60;

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
            createdAt: createdAtUTC // Store the user's time converted to UTC
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