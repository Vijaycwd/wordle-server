const express = require('express');
const router = express.Router();
const wordleSchema = require('../models/Wordle'); // Adjust the path to your schema if necessary

router.route('/wordle-score').post(async (req, res) => {
  const { username, useremail, wordlescore, createdAt } = req.body;

  const wordleScoreObject = {
      username,
      useremail,
      wordlescore,
      createdAt: new Date(createdAt) // Ensure createdAt is a Date object
  };

  try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      console.log(`Checking scores for email: ${useremail} between ${startOfDay} and ${endOfDay}`);

      const existingScore = await wordleSchema.findOne({
          useremail,
          createdAt: { $gte: startOfDay, $lt: endOfDay }
      });

      if (existingScore) {
          // console.log(`Score already exists for email: ${useremail} for today.`);
          return res.status(409).json({ message: "Score for this email already exists for today" });
      }

      const newScore = await wordleSchema.create(wordleScoreObject);
      // console.log(`New score created for email: ${useremail}`);
      res.status(201).json(newScore);

  } catch (error) {
      // console.error(`Error while creating score: ${error}`);
      res.status(500).json({ message: "Server error" });
  }
});

router.get('/', async (req, res) => {
  const { useremail } = req.query;
  // console.log(userEmail);
  if (!useremail) {
      return res.status(400).json({ message: "UserEmail is required" });
  }
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  try {
      const results = await wordleSchema.find({
          createdAt: { $gte: startOfDay, $lt: endOfDay }
      });
      res.json(results);
  } catch (error) {
      res.status(500).json({ message: "Server error" });
  }
});

module.exports = router