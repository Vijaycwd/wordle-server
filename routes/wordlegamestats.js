const express = require('express');
const router = express.Router();
const moment = require('moment');
const wordlegamestatSchema = require('../models/WordleGameStats');

router.post('/create-stats', async (req, res) => {
    // console.log(req.body);
    try {
        const { username, useremail, totalGamesPlayed, totalWinGames, currentStreak, maxStreak, lastgameisWin } = req.body;

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
            lastgameisWin:'false'
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
        const { username, useremail, totalWinGames, lastgameisWin } = req.body;

        // console.log(req.body);

        // Fetch current stats
        const currentStats = await wordlegamestatSchema.findOne({ useremail });

        if (!currentStats) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user played more than 30 days ago
        const lastGameDate = moment(currentStats.lastGameDate);
        const today = moment();
        // Calculate the number of days in the current month
        const daysInCurrentMonth = today.daysInMonth(); 

        const thirtyDaysAgo = moment().subtract(daysInCurrentMonth, 'days'); // More than 30 days ago


        let newStreak = lastgameisWin ? currentStats.currentStreak + 1 : 0;

        // If the last game was played more than 30 days ago, reset the streak
        if (lastGameDate.isBefore(thirtyDaysAgo, 'day')) {
            newStreak = lastgameisWin ? 1 : 0; // If the user won the last game, start a new streak; otherwise, reset
        }

        // Determine max streak
        const newMaxStreak = Math.max(currentStats.maxStreak, newStreak);
        // console.log(newMaxStreak);

        // Update fields
        const updateFields = {
            $set: { username, useremail, lastGameDate: today.toISOString() }, // Update last game date
            $inc: { totalGamesPlayed: 1, totalWinGames: totalWinGames ? 1 : 0 },
            $set: { currentStreak: newStreak, maxStreak: newMaxStreak }
        };

        // Update the document
        const stats = await wordlegamestatSchema.findOneAndUpdate(
            { useremail },
            updateFields,
            { new: true, upsert: true }  // Options: return the updated document, create if not found
        );
        
        console.log(stats);
        res.status(200).json(stats);
    } catch (err) {
        // console.error('Error updating stats:', err);
        res.status(500).json({ message: err.message });
    }
});
// Get total games played and statistics
router.get('/:useremail', async (req, res) => {
    try {
        const stats = await wordlegamestatSchema.findOne({ useremail: req.params.useremail });
        if (!stats) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router