const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const Router = require('./routes/route');
const flashes = require("./middlewares/siteMiddleware");
const isLoggedIn = require("./middlewares/authMiddleware");

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
    resave: false    
}));






// Routes

app.use(flashes);
app.use('/', Router);
app.use('/explore', Router);
app.use('/categories', Router);
app.use('/upload', Router);
app.use('/home', Router);
app.use('/login', Router);
app.use('/register', Router);
app.use('/addcategory', Router);





// Logout route
app.get('/logout', isLoggedIn, (req, res, next) => {
    req.session.user = null;
    res.flash("success", "Logged out Successfully");
    res.redirect("/");
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
