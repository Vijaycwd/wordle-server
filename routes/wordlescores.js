const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary

router.route('/wordle-score').post(async (req, res) => {
    console.log(req.body);
    const { username, useremail, wordlescore, guessDistribution, isWin, createdAt } = req.body;

    // Convert createdAt (which is from the frontend) to a Date object
    const userDate = new Date(createdAt);
    if (isNaN(userDate.getTime())) {
        return res.status(400).json({ message: 'Invalid createdAt date.' });
    }

    // Set start and end of the day based on the user's createdAt date (to match their local timezone)
    const startOfDay = new Date(userDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(userDate);
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // Check if a score already exists for the given email on the same day
        const existingScore = await wordleSchema.findOne({
            useremail: useremail,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        if (existingScore) {
            // Use the user's createdAt date to calculate time remaining
            const now = new Date(); // Use the current server time for comparison
            const timeDiff = endOfDay - now;

            if (timeDiff > 0) {
                const hoursRemaining = Math.floor(timeDiff / 1000 / 60 / 60);
                const minutesRemaining = Math.floor(timeDiff / 1000 / 60) % 60;

                return res.status(409).json({
                    message: `Today’s score has already been added. Play again in ${hoursRemaining} hours and ${minutesRemaining} minutes!`
                });
            }
        }

        // Create and save the new Wordle score with guess distribution
        const wordleScoreObject = new wordleSchema({
            username,
            useremail,
            wordlescore,
            guessDistribution,
            isWin,
            createdAt: userDate // Save user's createdAt time
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

//Get Server Timezone
router.route('/timezone').get((req, res) => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    res.json({ timeZone });
});

module.exports = router