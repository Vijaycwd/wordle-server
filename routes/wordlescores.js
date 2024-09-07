const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary

router.route('/wordle-score').post(async (req, res) => {
    // console.log(req.body);
    const { username, useremail, wordlescore, guessDistribution, isWin, createdAt, currentUserTime } = req.body;

    const userGameDate = new Date(createdAt).toISOString(); // Convert to UTC
    const userCurrentDate = new Date(currentUserTime).toISOString(); // Convert to UTC
    console.log(userCurrentDate);

    // if (isNaN(userGameDate.getTime()) || isNaN(userCurrentDate.getTime())) {
    //     return res.status(400).json({ message: 'Invalid date.' });
    // }

    // Set start and end of the day based on the user's createdAt date
    // Convert user game date and current date to UTC
    const startOfDayUTC = new Date(userGameDate);
    startOfDayUTC.setUTCHours(0, 0, 0, 0);

    const endOfDayUTC = new Date(userGameDate);
    endOfDayUTC.setUTCHours(23, 59, 59, 999);

    const userCurrentDateUTC = new Date(userCurrentDate);

    try {
        // Check if a score already exists for the given email on the same day
        const existingScore = await wordleSchema.findOne({
            useremail: useremail,
            createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC }
        });
        
        if (existingScore) {
            // Calculate remaining time based on user's current time

            console.log('userGameDate in UTC:', userGameDate.toISOString());
            console.log('userCurrentDate in UTC:', userCurrentDate.toISOString());
            console.log('startOfDayUTC:', startOfDayUTC.toISOString());
            console.log('endOfDayUTC:', endOfDayUTC.toISOString());

            const timeDiff = endOfDayUTC - userCurrentDateUTC;
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