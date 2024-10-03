const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();

const multer = require('multer');
const path = require('path');

//Express Data

const wordledata = require('./routes/wordlescores');
const userdata = require('./routes/useroute');
const filesdata = require('./routes/filesroute')
const wordlegamestat = require('./routes/wordlegamestats');



//Middleware

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended:true
}))
app.use(express.json());
app.use(express.static('public'));
app.use(morgan('dev'));


const uri = 'mongodb+srv://admin:fCSRvxosWWKRgzYK@cluster0.npxurqz.mongodb.net/Wordlegame?retryWrites=true&w=majority';
mongoose.connect(uri)
.then(() =>console.log('connected successfully'))
.catch((err) => {console.error(err);})
const connection = mongoose.connection;
connection.once('open',()=>{
  console.log("Mongoose database Connected Successfully");
})


//apply cors
app.use(cors());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//localhost:5001/emp/create-employee-> frontend entpoint
app.use('/wordle', wordledata);

app.use('/wordle-game-stats', wordlegamestat);

app.use('/use', userdata);

app.use('/files', filesdata);

app.set('view engine', 'ejs')

app.use(cors({ origin: 'https://wordle-server-nta6.onrender.com' })); // Change this to your React app URL
