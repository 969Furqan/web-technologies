const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/user');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const Category = require('../models/category');

const router = express.Router();

// Mongo URI
const mongoURI = 'mongodb://localhost:27017/wallpapers';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });





// Category routes


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


router.get('/register', (req, res) => {
  
    res.render('index', { page: 'register'});
  
});

router.get('/login', (req, res) => {
  
    res.render('index', { page: 'login'});
  
});

router.get('/addcategory', (req, res) => {
      
     res.render('index', { page: 'addcategory'});
      
    
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



router.post('/category/add', async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new Category({
            name: name,
            description: description
        });
        await newCategory.save();
        res.redirect('/categories'); // Redirect back to categories page or to success page
    } catch (error) {
        console.error('Failed to add category:', error);
        res.status(500).send('Failed to add category');
    }
  });

  router.get('/categories', async (req, res) => {
    try {
        const Categories = await Category.find({});
        res.render('index', {page:'categories', Categories }); // Pass categories to the EJS template
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).send('Error loading categories');
    }
});

router.get('/upload', async (req, res) => {
    try {
        const Categories = await Category.find({}); // Fetch all categories from the database
        res.render('index', { page:'upload', Categories }); // Pass categories to the view
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).send('Error loading categories');
    }
});

module.exports = router;