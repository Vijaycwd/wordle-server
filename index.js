const express = require('express');
const app = express();
const cors = require('cors');
const port = 5001;
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const uri = 'mongodb+srv://admin:fCSRvxosWWKRgzYK@cluster0.npxurqz.mongodb.net/Wordgamle?retryWrites=true&w=majority';
mongoose.connect(uri)
.then(() =>console.log('connected successfully'))
.catch((err) => {console.error(err);})
const connection = mongoose.connection;
connection.once('open',()=>{
  console.log("Mongoose database Connected Successfully");
})


//Middleware
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended:true
}))
app.use(express.json());



const wordledata = require('./routes/wordlescores');

app.use('/wordle', wordledata);

app.get('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log("Server is listening on port " + port + "!!");
});