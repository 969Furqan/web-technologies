const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');




const app = express();

// Connect to MongoDB

mongoose.connect("mongodb://localhost:27017/wallpapers").then((data) => {
  console.log("DB Connected");
});



// Set view engine and views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
const Router = require('./routes/route');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/uploads', (req, res) => {
  const directoryPath = path.join(__dirname, 'public/uploads');

  fs.readdir(directoryPath, function (err, files) {
      if (err) {
          res.status(500).send({
              message: "Unable to scan files!",
          });
      } 
      let imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
      res.send(imageFiles);
  });
});


// Initialize session middleware
app.use(session({
  secret: 'secret', // Change the secret to a long, random string in production
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/wallpapers' })
}));



// Passport config
require('./config/passport')(passport); // This will be your Passport configuration file
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
res.locals.user = req.user;  // Make user object globally accessible in views
next();
});

app.use('/', Router);
app.use('/explore', Router);
app.use('/categories', Router);
app.use('/upload', Router);
app.use('/home', Router);
app.use('/login', Router);
app.use('/register', Router);



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});