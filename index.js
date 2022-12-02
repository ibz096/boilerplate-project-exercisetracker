const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const mySecret = process.env['MONGO_URI']

const mongoose = require('mongoose');

mongoose.connect(mySecret,{ useNewUrlParser: true, useUnifiedTopology: true })
  .then(
    () => { console.log("DB Connected") },
    err => { console.log(`Database Connection: Failure.\n${err}`) }
  );
//New User Schema
const userSchema = new mongoose.Schema({
  username: String,
});

//Exercise Schema
const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: Date,
  user_id: String
});
//User Model
const User = mongoose.model('User', userSchema);
// Exercise Model
const Exercise = mongoose.model('Exercise', exerciseSchema)

app.use(cors())
app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', (req, res) => {
  User.find({}, (err, data) => {
    res.send(data)
  })
})

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

app.post('/api/users/:_id/exercises', async (req, res) => {
  let userId = req.params._id
  //Check if date field is empty. If no date is supplied, the current date will be used.
  let date = ( req.body.date ? req.body.date : new Date())
  
  try {
    //Check if user exists in DB
    const user = await User.findById(userId).exec();
    //If user exists create new Excercise record
    if (user) {
      let newExercise = new Exercise({
        username: user.username,
        description: req.body.description,
        duration: req.body.duration,
        date: date,
        user_id: user._id
      })
      console.log(newExercise)
      try {
        //Save record
        let saveExercise = await newExercise.save()
        // Send JSON response of the newly created object
        res.json({
          username: saveExercise.username,
          description: saveExercise.description,
          duration: saveExercise.duration,
          date: new Date(saveExercise.date).toDateString(),
          _id: saveExercise.user_id
        })
        // console.log()
      } catch (error) {
        console.log(`Error while saving Exercise document: ${error}`)
      }
      
    } else { res.send('User not found') }
    
  } catch (error) {
    console.log(error)
    res.send('Error. Please view the console')
  }
  
})

//Make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
app.get('/api/users/:_id/logs', async (req, res) => {
  let userId = req.params._id;
  //Query the Exercise collection where using the userId(_id) provided
  try {
    let exercises = await Exercise.find({user_id: userId}).exec();
    console.log(exercises)
    //count = exercises.length
    res.json({
      username: exercises[0].username,
      count: exercises.length,
      _id: exercises[0].user_id,
      log: exercises.map( (obj) => ({
        description: obj.description,
        duration: obj.duration,
        date: obj.date
        
  }))
    });
  } catch (error) {
    console.log(error)
    res.send('Error. Please view the console')
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
