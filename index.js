const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const mySecret = process.env['MONGO_URI']

const mongoose = require('mongoose');

mongoose.connect(mySecret,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(
    () => { console.log("Connected") },
    err => { console.log(`Database Connection: Failure.\n${err}`) }
  );
//New User Schema and Model
const userSchema = new mongoose.Schema({
  username: String
});

const User = mongoose.model('User', userSchema);
//test
// New Execercise Schema and Model

app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', (req, res) => {
  //Save New User
  let newUser = new User({username: req.body.username})
  newUser.save((err, data) => {
    if (err) return err
    res.json({
      username: data.username,
      _id: data._id
    })
  }) 
  
})

app.get('/api/users', (req, res) => {
  User.find({}, (err, data) => {
    console.log(data)
    res.send(data)
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
