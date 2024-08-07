const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const port = 5001;
const multer = require('multer');

//Express Data

const wordledata = require('./routes/wordlescores');
const userdata = require('./routes/useroute');

const filesdata = require('./routes/filesroute')






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

//Image Storage



//apply cors
app.use(cors());

//localhost:5001/emp/create-employee-> frontend entpoint
app.use('/wordle', wordledata);

app.use('/use', userdata);

app.use('/files', filesdata);

app.set('view engine', 'ejs')



const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "uploads")
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}_${file.originalname}`)
  }
})

const upload = multer({storage})

app.post('/upload', upload.single('file'), (req, res) => {
  console.log(req.body)
  console.log(req.file)
})

app.listen(port);