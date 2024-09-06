const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary

router.route('/wordle-score').post(async (req, res) => {
    console.log(req.body);
    const { username, useremail, wordlescore, guessDistribution, isWin, createdAt } = req.body;

    const startOfDay = new Date(createdAt);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        // Check if a score already exists for the given email on the same day
        const existingScore = await wordleSchema.findOne({
            useremail: useremail,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        if (existingScore) {
            const now = new Date();
            const hoursRemaining = Math.floor((endOfDay - now) / 1000 / 60 / 60);
            const minutesRemaining = Math.floor((endOfDay - now) / 1000 / 60) % 60;

            return res.status(409).json({
                message: `Today’s score has already been added.  Play again in ${hoursRemaining} hours and ${minutesRemaining} minutes!`
            });
        }

        // Create and save the new Wordle score with guess distribution
        const wordleScoreObject = new wordleSchema({
            username,
            useremail,
            wordlescore,
            guessDistribution,
            isWin // Include guessDistribution in the document
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