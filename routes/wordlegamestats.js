const express = require('express');
const router = express.Router();
const wordlegamestatSchema = require('../models/WordleGameStats');

router.post('/update', async (req, res) => {
    try {
        const { username, useremail, totalWinGames  } = req.body;

        console.log(req.body);

        const updateFields = {
            $set: { username, useremail }, // Set or update these fields
            $inc: { totalGamesPlayed: 1 }  // Increment totalGamesPlayed
        };

        if (totalWinGames) {
            updateFields.$inc.totalWinGames = 1;
        }

        const stats = await wordlegamestatSchema.findOneAndUpdate(
            { useremail },  // Query: find the document with this useremail
            updateFields,  // Update fields
            { new: true, upsert: true }  // Options: return the updated document, create if not found
        );
        console.log(stats);
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get total games played
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