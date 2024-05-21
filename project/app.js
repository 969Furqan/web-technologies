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





const flash = require('connect-flash');

// Set up session middleware first
app.use(session({
    secret: 'YourSecretKey', // Replace 'YourSecretKey' with a real secret string
    saveUninitialized: true,
    resave: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/wallpapers' })
}));

// Then use flash middleware
app.use(flash());

// Setup to make the flash messages available to all views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Used by Passport as per your setup
    next();
});



// Passport config
require('./config/passport')(passport); // This will be your Passport configuration file
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
res.locals.user = req.user;  // Make user object globally accessible in views
next();
});

// Create session store in cookies with a timer of 1 week
app.use(session({
  secret: 'YourSecretKey',
  saveUninitialized: true,
  resave: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/wallpapers',
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds
    }
  })
}));



app.get('/logout', (req, res, next) => {
  req.logout(function(err) {  // Include a callback function to handle the logout process
      if (err) {
          return next(err);  // Handle possible errors during logout
      }
      req.session.destroy((err) => {  // Proceed to destroy the session
          if (err) {
              console.error('Failed to destroy the session during logout.', err);
              return next(err);
          }
          res.clearCookie('connect.sid'); // Clear the session cookie, assuming 'connect.sid' is the cookie name
          res.redirect('/login');  // Redirect to the login page after a successful logout
      });
  });
});




app.use('/', Router);
app.use('/explore', Router);
app.use('/categories', Router);
app.use('/upload', Router);
app.use('/home', Router);
app.use('/login', Router);
app.use('/register', Router);
app.use('/addcategory', Router);



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});