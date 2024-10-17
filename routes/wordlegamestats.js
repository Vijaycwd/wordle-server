const express = require('express');
const router = express.Router();
const moment = require('moment');
const wordlegamestatSchema = require('../models/WordleGameStats');

router.post('/create-stats', async (req, res) => {
    // console.log(req.body);
    try {
        const { username, useremail, totalGamesPlayed, totalWinGames, currentStreak, maxStreak, guessDistribution, lastgameisWin, handleHighlight } = req.body;

        // Check if the user already exists
        const existingStats = await wordlegamestatSchema.findOne({ useremail });
        if (existingStats) {
            return res.status(400).json({ message: 'User stats already exist' });
        }

        // Create a new Wordle game stats entry
        const newStats = new wordlegamestatSchema({
            username,
            useremail,
            totalGamesPlayed, // Initialize with the first game played
            totalWinGames,
            currentStreak,
            maxStreak, // Initialize maxStreak with the currentStreak
            guessDistribution,
            lastgameisWin,
            handleHighlight
        });

        // Save the new stats document to the database
        const savedStats = await newStats.save();

        res.status(201).json(savedStats); // Return the created stats object
    } catch (err) {
        // console.error('Error creating new stats:', err);
        res.status(500).json({ message: err.message });
    }
});

// Update Wordle game statistics
router.post('/update', async (req, res) => {
    try {
        const { username, useremail, lastgameisWin, guessDistribution, handleHighlight} = req.body;

        console.log('Frontend Data:', req.body);

        // Fetch current stats
        const currentStats = await wordlegamestatSchema.findOne({ useremail });
        if (!currentStats) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Current Stats:', currentStats);

        // Streak and guess distribution logic
        const lastGameDate = moment(currentStats.lastGameDate);
        const today = moment();
        const thirtyDaysAgo = moment().subtract(30, 'days');

        let newStreak = lastgameisWin ? currentStats.currentStreak + 1 : 0;
        if (lastGameDate.isBefore(thirtyDaysAgo, 'day')) {
            newStreak = lastgameisWin ? 1 : 0;
        }
        const newMaxStreak = Math.max(currentStats.maxStreak, newStreak);

        // Validate that guessDistribution is an array
        if (!Array.isArray(guessDistribution) || guessDistribution.length !== 6) {
            return res.status(400).json({ message: 'Invalid guess distribution array' });
        }

        // Ensure guessDistribution in DB is initialized (if it's null or undefined)
        const currentGuessDistribution = currentStats.guessDistribution || [0, 0, 0, 0, 0, 0];
        console.log('Current Guess Distribution:', currentGuessDistribution);

        // Update the guess distribution by adding values from the incoming array
        const updatedGuessDistribution = currentGuessDistribution.map((count, index) => 
            count + (guessDistribution[index] || 0)
        );

        console.log('Updated Guess Distribution:', updatedGuessDistribution);

        const updatedIndices = updatedGuessDistribution.map((count, index) => {
            return count > currentGuessDistribution[index] ? index : null;
        }).filter(index => index !== null); // Filter out null values

        console.log('Updated Indices:', updatedIndices);

        // Prepare update fields
        const updateFields = {
            $set: {
                username,
                useremail,
                lastGameDate: today.toISOString(),
                lastgameisWin,
                currentStreak: newStreak,
                maxStreak: newMaxStreak,
                guessDistribution: updatedGuessDistribution,
                handleHighlight: updatedIndices
            },
            $inc: {
                totalGamesPlayed: 1,
                totalWinGames: lastgameisWin ? 1 : 0,
            }
        };

        // Update the document
        const stats = await wordlegamestatSchema.findOneAndUpdate(
            { useremail },
            updateFields,
            { new: true, upsert: true }
        );

        console.log('Updated Stats:', stats);
        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        console.error('Error updating stats:', err);
        res.status(500).json({ message: err.message });
    }
});






// Get total games played and statistics
router.get('/:useremail', async (req, res) => {
    try {
        const stats = await wordlegamestatSchema.find({ useremail: req.params.useremail });
        if (!stats) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router