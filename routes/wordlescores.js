const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary

// Helper function to validate date inputs
const isValidDate = (date) => !isNaN(new Date(date).getTime());

router.route('/wordle-score').post(async (req, res) => {
    const { username, useremail, wordlescore, guessDistribution, isWin, createdAt, currentUserTime } = req.body;

    // Validate date inputs
    if (!isValidDate(createdAt) || !isValidDate(currentUserTime)) {
        return res.status(400).json({ message: 'Invalid date provided.' });
    }

    // Convert createdAt and currentUserTime to Date objects in UTC
    const userGameDate = new Date(createdAt);
    const userCurrentDate = new Date(currentUserTime);

    // Set start and end of the day based on the user's createdAt date
    const startOfDayUTC = new Date(userGameDate);
    startOfDayUTC.setUTCHours(0, 0, 0, 0);

    const endOfDayUTC = new Date(userGameDate);
    endOfDayUTC.setUTCHours(23, 59, 59, 999);

    try {
        // Check if a score already exists for the given email on the same day
        const existingScore = await wordleSchema.findOne({
            useremail: useremail,
            createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC }
        });

        if (existingScore) {
            // Calculate remaining time based on user's current time
            const timeDiff = endOfDayUTC - userCurrentDate;
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
            createdAt: userGameDate // Save the game time as a Date object
        });

        const newScore = await wordleScoreObject.save();
        res.status(201).json(newScore);

    } catch (error) {
        console.error('Error saving score:', error); // Improved error logging
        res.status(500).json({ message: 'Error saving score.', error: error.message });
    }
});

router.route('/').get(async (req, res) => {
    try {
        const scores = await wordleSchema.find();
        res.json(scores);
    } catch (err) {
        console.error('Error retrieving scores:', err); // Improved error logging
        res.status(400).json({ message: 'Error retrieving scores.', error: err.message });
    }
});

module.exports = router;
