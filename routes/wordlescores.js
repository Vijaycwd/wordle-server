const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary
const moment = require('moment-timezone'); // For handling time zones

router.route('/wordle-score').post(async (req, res) => {
    const { username, useremail, wordlescore, guessDistribution, isWin, createdAt, currentUserTime, timeZone } = req.body;

    // Check if timeZone is provided
    if (!timeZone) {
        return res.status(400).json({ message: 'Time zone is required.' });
    }

    // Convert createdAt and currentUserTime to Date objects in the user's time zone
    const userGameDate = moment.tz(createdAt, timeZone).toDate();
    const userCurrentDate = moment.tz(currentUserTime, timeZone).toDate();
    
    if (isNaN(userGameDate.getTime()) || isNaN(userCurrentDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date or time zone.' });
    }

    // Set start and end of the day based on the user's game date in the provided time zone
    const startOfDay = moment.tz(userGameDate, timeZone).startOf('day').utc().toDate();
    const endOfDay = moment.tz(userGameDate, timeZone).endOf('day').utc().toDate();

    try {
        // Check if a score already exists for the given email on the same day (in UTC)
        const existingScore = await wordleSchema.findOne({
            useremail: useremail,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        if (existingScore) {
            // Calculate remaining time based on the user's current time
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
            createdAt: userGameDate // Save the game time in UTC
        });

        const newScore = await wordleScoreObject.save();
        res.status(201).json(newScore);

    } catch (error) {
        // Handle error in saving the score
        res.status(500).json({ message: 'Error saving score.', error });
    }
});

// router.route('/').get((req, res) => {
//     wordleSchema.find()
//         .then(scores => res.json(scores))
//         .catch(err => res.status(400).json({ message: "Error retrieving scores", error: err }));
// });

router.route('/').get((req, res) => {
    const { timeZone } = req.query;

    // Check if timeZone is provided
    if (!timeZone) {
        return res.status(400).json({ message: 'Time zone is required.' });
    }

    try {
        // Get current time in the user's time zone
        const currentTime = moment.tz(timeZone).toDate();
        console.log('Current Time',currentTime);
        // Set start and end of the day based on the user's current date in the provided time zone
        const startOfDay = moment.tz(currentTime, timeZone).startOf('day').utc().toDate();
        const endOfDay = moment.tz(currentTime, timeZone).endOf('day').utc().toDate();
        console.log('Current Days',startOfDay,endOfDay);
        // Find scores created between the start and end of the day
        wordleSchema.find({
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        })
        .then(scores => res.json(scores))
        .catch(err => res.status(400).json({ message: "Error retrieving scores", error: err }));

    } catch (error) {
        res.status(500).json({ message: "Error processing the time zone.", error });
    }
});

module.exports = router;
