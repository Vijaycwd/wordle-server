const express = require('express');
const router = express.Router();
const connectionsSchema = require('../models/Connections'); // Adjust the path to your schema if necessary
const moment = require('moment-timezone'); // For handling time zones

router.route('/connections-score').post(async (req, res) => {
    const { username, useremail, connectionsscore, guessDistribution, isWin, createdAt, currentUserTime, timeZone } = req.body;

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
        const existingScore = await connectionsSchema.findOne({
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

        // Create and save the new connections score
        const connectionsScoreObject = new connectionsSchema({
            username,
            useremail,
            connectionsscore,
            guessDistribution,
            isWin,
            createdAt: userGameDate // Save the game time in UTC
        });

        const newScore = await connectionsScoreObject.save();
        res.status(201).json(newScore);

    } catch (error) {
        // Handle error in saving the score
        res.status(500).json({ message: 'Error saving score.', error });
    }
});

router.get('/:useremail', async (req, res) => {
    const { useremail } = req.params;
    const { timeZone } = req.query;

    // Check if time zone is provided in the query parameters
    if (!timeZone) {
        return res.status(400).json({ message: 'Time zone is required.' });
    }

    try {
        // Retrieve all statistics for the user
        const stats = await connectionsSchema.find({ useremail });

        if (!stats || stats.length === 0) {
            return res.status(404).json({ message: 'User not found or no scores available' });
        }

        // Convert each createdAt timestamp to the user's local time based on the provided time zone
        const formattedStats = stats.map(stat => ({
            ...stat.toObject(),
            createdAtLocal: moment.tz(stat.createdAt, timeZone).format('DD-MM-YYYY HH:mm:ss') // Use consistent format
        }));
        

        res.status(200).json(formattedStats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// New endpoint to get statistics by date
router.get('/:useremail/date', async (req, res) => {
    const { useremail } = req.params;
    const { date, timeZone } = req.query;

    // Check if both date and time zone are provided in the query parameters
    if (!date || !timeZone) {
        return res.status(400).json({ message: 'Date and time zone are required.' });
    }

    try {
        // Retrieve all statistics for the user
        const stats = await connectionsSchema.find({ useremail });

        if (!stats || stats.length === 0) {
            return res.status(404).json({ message: 'User not found or no scores available.' });
        }

        // Convert the selected date to the start and end of the day in the user's local time zone
        const startOfDay = moment.tz(date, 'DD-MM-YYYY', timeZone).startOf('day').toDate();
        const endOfDay = moment.tz(date, 'DD-MM-YYYY', timeZone).endOf('day').toDate();

        // Filter statistics based on whether the createdAt timestamp falls within the start and end of the selected day
        const filteredStats = stats.filter(stat => {
            const createdAtLocal = moment.tz(stat.createdAt, timeZone).toDate();
            return createdAtLocal >= startOfDay && createdAtLocal <= endOfDay;
        });

        // Return filtered stats or message if no records found for the selected date
        if (filteredStats.length > 0) {
            res.status(200).json(filteredStats);
        } else {
            res.status(404).json({ message: `No scores found for the selected date: ${date}.` });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
