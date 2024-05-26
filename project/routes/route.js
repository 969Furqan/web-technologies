const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Category = require('../models/category');
const Wallpaper = require('../models/wallpaper');
const upload = require('../middlewares/upload');

const router = express.Router();

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/wallpapers")
    .then((data) => {
        console.log("DB Connected");
    })
    .catch(err => {
        console.error("DB Connection Error: ", err);
    });


// Home routes
router.get('/home', (req, res) => {
    res.render('index', { page: 'home', user: req.user });
});

router.get('/', (req, res) => {
    res.render('index', {
        page: 'home',
        user: req.user // Ensure `user` is passed to the template
    });
});



// Register and login routes
router.get('/register', (req, res) => {
    res.render('index', { page: 'register', user: req.user });
});

router.get('/login', (req, res) => {
    res.render('index', { page: 'login', user: req.user });
});

router.get('/addcategory', (req, res) => {
    res.render('index', { page: 'addcategory', user: req.user });
});

router.post("/register", async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            return res.redirect("/register?message=User already exists with that email");
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
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

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login?message= unable to login',
    failureFlash: true
}));

router.post('/addcategory/add', async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCategory = new Category({
            name: name,
            description: description
        });
        await newCategory.save();
        res.redirect('/categories');
    } catch (error) {
        console.error('Failed to add category:', error);
        res.status(500).send('Failed to add category');
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.render('index', { page: 'categories', categories, user: req.user });
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).send('Error loading categories');
    }
});

router.get('/upload', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.render('index', { page: 'upload', categories, user: req.user });
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).send('Error loading categories');
    }

    router.get('/upload', (req, res) => {
        res.render('index', {
            page: 'upload',
            user: req.user  // Ensure `user` is passed to the template
        });
      });
});

router.post('/upload', upload, async (req, res) => {
    const uploaderId = req.user._id;
    const { title, description, categoryId, tags } = req.body;
    const newWallpaper = new Wallpaper({
      title,
      description,
      uploaderId,
      categoryId,
      tags: tags.split(','),
      img: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });
  
    try {
      await newWallpaper.save();
      req.flash('success_msg', 'Wallpaper uploaded successfully!');
      res.redirect('/upload');
    } catch (err) {
      console.error(err);
      req.flash('error_msg', 'Failed to upload wallpaper.');
      res.redirect('/upload');
    }
  });

// Explore route with pagination
router.get('/explore', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Number of wallpapers per page
        const skip = (page - 1) * limit;

        const wallpapers = await Wallpaper.find({})
            .sort({ uploadDate: -1 }) // Sort by upload date, latest first
            .skip(skip)
            .limit(limit);

        const count = await Wallpaper.countDocuments(); // Total number of wallpapers
        const totalPages = Math.ceil(count / limit);

        res.render('index', {
            page: 'explore',
            wallpapers,
            currentPage: page,
            totalPages,
            user: req.user
        });
    } catch (error) {
        console.error('Failed to fetch wallpapers:', error);
        res.status(500).send('Error loading wallpapers');
    }
});


router.get('/result/:id', async (req, res) => {
    try {
        // Fetch the wallpaper and populate the 'uploadedBy' field
        const wallpaper = await Wallpaper.findById(req.params.id).populate('uploaderId', 'username'); // Specifying fields to return. Adjust as necessary.

        if (!wallpaper) {
            return res.status(404).send("Wallpaper not found");
        }

        res.render('index', { page: 'result', wallpaper: wallpaper, user: req.user });
    } catch (error) {
        console.error("Error fetching wallpaper details:", error);
        res.status(500).send("Error loading wallpaper details");
    }
});

// Example route in your Express app
router.get('/random-wallpapers', async (req, res) => {
    try {
        const wallpapers = await Wallpaper.aggregate([
            { $sample: { size: 8 } }  // Adjust size to control number of random wallpapers
        ]);
        res.json(wallpapers);
    } catch (err) {
        res.status(500).send('Server error');
    }
});


router.get('/search', async (req, res) => {
    const searchQuery = req.query.query || '';  // Ensure it's a string, default to empty if undefined

    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 4;  // Number of wallpapers per page
        const skip = (page - 1) * limit;

        // Ensure we only attempt a search if there is a non-empty query
        if (searchQuery.trim()) {
            const wallpapers = await Wallpaper.find({
                tags: { $regex: searchQuery, $options: 'i' }
            })
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit);

            const count = await Wallpaper.countDocuments({
                tags: { $regex: searchQuery, $options: 'i' }
            });

            const totalPages = Math.ceil(count / limit);

            res.render('index', {
                page: 'search',
                wallpapers,
                currentPage: page,
                totalPages,
                user: req.user,
                searchQuery
            });
        } else {
            // Handle the case where there is no valid search query
            res.render('index', {
                page: 'search',
                wallpapers: [],
                currentPage: 1,
                totalPages: 1,
                user: req.user,
                searchQuery: ''
            });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).send('Failed to execute search');
    }
});


  
module.exports = router;
