const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const path = require('path');
const port = 5001;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
// MongoDB connection
const uri = 'mongodb+srv://admin:fCSRvxosWWKRgzYK@cluster0.npxurqz.mongodb.net/Wordlegame?retryWrites=true&w=majority';
mongoose.connect(uri)
  .then(() => console.log('Connected successfully'))
  .catch((err) => { console.error(err); });

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("Mongoose database Connected Successfully");
});

// CORS setup
app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Routes
const wordledata = require('./routes/wordlescores');
const userdata = require('./routes/useroute');
const filesdata = require('./routes/filesroute');
const wordlegamestat = require('./routes/wordlegamestats');

app.use('/wordle', wordledata);
app.use('/wordle-game-stats', wordlegamestat);
app.use('/use', userdata);
app.use('/files', filesdata);

app.set('view engine', 'ejs');

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
