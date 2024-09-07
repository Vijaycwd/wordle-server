const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary
const moment = require('moment-timezone'); // For better time zone handling

// Helper function to validate date inputs
const isValidDate = (date) => !isNaN(new Date(date).getTime());

// Function to get current date-time in a given time zone
const getCurrentDateTimeInZone = (timeZone) => {
    return moment.tz(timeZone).format(); // Format date-time in the given time zone
};
// Middleware to convert time zone to UTC
const convertToUTC = (date, timeZone) => {
    return moment.tz(date, timeZone).utc().toDate(); // Convert given date-time to UTC
};

router.route('/wordle-score').post(async (req, res) => {
    const { username, useremail, wordlescore, guessDistribution, isWin, createdAt, currentUserTime, timeZone } = req.body;
     console.log()
    // Validate date inputs
    if (!isValidDate(createdAt) || !isValidDate(currentUserTime) || !timeZone) {
        return res.status(400).json({ message: 'Invalid date or time zone provided.' });
    }

    // Convert createdAt and currentUserTime to Date objects in UTC
    const userGameDate = new Date(createdAt);
    const userCurrentDate = new Date(currentUserTime);

    // Convert both to UTC using the provided time zone
    const userGameDateUTC = convertToUTC(userGameDate, timeZone);
    const userCurrentDateUTC = convertToUTC(userCurrentDate, timeZone);

    // Set start and end of the day based on the user's createdAt date in UTC
    const startOfDayUTC = new Date(userGameDateUTC);
    startOfDayUTC.setUTCHours(0, 0, 0, 0);

    const endOfDayUTC = new Date(userGameDateUTC);
    endOfDayUTC.setUTCHours(23, 59, 59, 999);

    console.log('User Current Date (UTC):', userCurrentDateUTC);
    console.log('End of Day (UTC):', endOfDayUTC);

    try {
        // Check if a score already exists for the given email on the same day
        const existingScore = await wordleSchema.findOne({
            useremail: useremail,
            createdAt: { $gte: startOfDayUTC, $lt: endOfDayUTC }
        });

        if (existingScore) {
            // Calculate remaining time based on user's current time
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
            createdAt: userGameDateUTC // Save the game time as a Date object in UTC
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
