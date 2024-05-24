const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const Router = require('./routes/route');

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/wallpapers", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then((data) => {
  console.log("DB Connected");
}).catch(err => {
  console.error("DB Connection Error: ", err);
});

// Set view engine and views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
    secret: 'YourSecretKey', // Replace 'YourSecretKey' with a real secret string
    saveUninitialized: true,
    resave: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/wallpapers' })
}));

// Flash messages setup
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error'); // Used by Passport as per your setup
    next();
});

// Passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Middleware to make user globally available
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

// Routes
app.use('/', Router);
app.use('/explore', Router);
app.use('/categories', Router);
app.use('/upload', Router);
app.use('/home', Router);
app.use('/login', Router);
app.use('/register', Router);
app.use('/addcategory', Router);



// Logout route
app.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('Failed to destroy the session during logout.', err);
                return next(err);
            }
            res.clearCookie('connect.sid');
            res.redirect('/login');
        });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
