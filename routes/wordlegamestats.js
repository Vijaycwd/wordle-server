const express = require('express');
const router = express.Router();
const wordlegamestatSchema = require('../models/WordleGameStats');

// Update Wordle game statistics
router.post('/update', async (req, res) => {
    try {
        const { username, useremail, totalWinGames, lastgameisWin } = req.body;

        console.log(req.body);

        // Fetch current stats
        const currentStats = await wordlegamestatSchema.findOne({ useremail });

        if (!currentStats) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Calculate new streak
        const newStreak = lastgameisWin ? currentStats.currentStreak + 1 : 0;

        // Determine max streak
        const newMaxStreak = Math.max(currentStats.maxStreak, newStreak);

        // Update fields
        const updateFields = {
            $set: { username, useremail },
            $inc: { totalGamesPlayed: 1, totalWinGames: totalWinGames ? 1 : 0 },
            $set: { currentStreak: newStreak, maxStreak: newMaxStreak}
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
        console.error('Error updating stats:', err);
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