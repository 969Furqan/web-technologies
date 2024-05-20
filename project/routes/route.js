const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/user');
const passport = require('passport');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Mongo URI
const mongoURI = 'mongodb://localhost:27017/wallpapers';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });





// Category routes
router.get('/categories', (req, res) => {
  res.render('index', { page: 'categories' });
});

// Home routes
router.get('/home', (req, res) => {
    res.render('index', { page: 'home' });
});

router.get('/', (req, res) => {
    res.render('index', {
        page: 'home',
        user: req.user  // Ensure `user` is passed to the template
    });
});


// Explore route
router.get('/explore', (req, res) => {
    res.render('index', { page: 'explore' });
});

// Upload GET route to render the upload form
router.get('/upload', async (req, res) => {
  
    res.render('index', { page: 'upload'});
  
});

router.get('/register', (req, res) => {
  
    res.render('index', { page: 'register'});
  
});

router.get('/login', (req, res) => {
  
    res.render('index', { page: 'login'});
  
});






router.post("/register", async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });  // Use 'User' model correctly

        if (existingUser) {
            return res.redirect("/register?message=User already exists with that email");
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);  // Hash the password with a salt round of 10
        console.log(req.body);
        const newUser = new User({
            email: req.body.email,
            password: hashedPassword, 
            username: req.body.username
        });
        await newUser.save();
        res.redirect("/login");
    } catch (error) {
        console.error("Registration Error:", error);
        res.redirect("/register");
    }
});



// Login handle
router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));


module.exports = router;