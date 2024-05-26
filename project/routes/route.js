const express = require('express');
const mongoose = require('mongoose');
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
router.get('/home', async (req, res) => {
    try {
        const categories = await Category.aggregate([
            { $sample: { size: 5 } }
        ]);// Fetches 5 random categories
        // Other logic for the page if necessary...
        res.render('index', {
            page:'home', // Assuming 'explore' is your EJS file for this page
            categories,
            user: req.session.user
            // other variables if needed
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Server error when fetching categories');
    };
});

router.get('/', async (req, res) => {
    try {
        const categories = await Category.aggregate([
            { $sample: { size: 5 } }
        ]); // Fetches 5 random categories
        // Other logic for the page if necessary...
        res.render('index', {
            page:'home', // Assuming 'explore' is your EJS file for this page
            categories,
            user: req.session.user
            // other variables if needed
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Server error when fetching categories');
    };
});



// Register and login routes
router.get('/register', (req, res) => {
    res.render('index', { page: 'register', user: req.session.user });
});

router.get('/login', (req, res) => {
    res.render('index', { page: 'login', user: req.session.user });
});

router.get('/addcategory', (req, res) => {
    res.render('index', { page: 'addcategory', user: req.session.user });
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

router.post("/login", async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email }); // Correctly wait for the promise to resolve
        if (!user) {
            res.flash("danger", "User with given email does not exist");
            return res.redirect("/register");
        }

        bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
            if (err) {
                res.flash("danger", "Error checking password");
                return res.redirect("/login");
            }
            if (isMatch) {
                // Serialize only necessary user info, not the whole user object
                req.session.user = {
                    id: user._id,
                    name: user.username,
                    email: user.email,
                    role: user.role
                };
                res.flash("success", req.session.user.name + " Logged In");
                return res.redirect("/");
            } else {
                res.flash("danger", "Invalid Password");
                return res.redirect("/login");
            }
        });  
    } catch (error) {
        console.error("Login Error:", error);
        res.flash("danger", "Server error during login");
        res.redirect("/login");
    }
});


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
        res.render('index', { page: 'categories', categories});
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).send('Error loading categories');
    }
});

router.get('/upload', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.render('index', { page: 'upload', categories});
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        res.status(500).send('Error loading categories');
    }

    router.get('/upload', (req, res) => {
        res.render('index', {
            page: 'upload' // Ensure `user` is passed to the template
        });
      });
});

router.post('/upload', upload, async (req, res) => {
    const session = req.session.user;
    console.log(session);
    const uploaderId = session.id;
    console.log(uploaderId);
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
      
      res.redirect('/upload');
    } catch (err) {
      console.error(err);
      
      res.redirect('/upload');
    }
  });

// Explore route with pagination
router.get('/explore', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Number of wallpapers per page
        const skip = (page - 1) * limit;

        const wallpapers = await Wallpaper.aggregate([
            { $skip: skip },
            { $limit: limit }
        ]);

        const count = await Wallpaper.countDocuments(); // Total number of wallpapers
        const totalPages = Math.ceil(count / limit);

        res.render('index', {
            page: 'explore',
            wallpapers,
            currentPage: page,
            totalPages,
            user: req.session.user
        });
    } catch (error) {
        console.error('Failed to fetch wallpapers:', error);
        res.status(500).send('Error loading wallpapers');
    }
});


router.get('/result/:id', async (req, res) => {
    try {
        // Fetch the wallpaper and populate the 'uploadedBy' field
        const wallpaper = await Wallpaper.findById(req.params.id).populate('uploaderId', 'username').populate('categoryId', 'name'); // Specifying fields to return. Adjust as necessary.

        if (!wallpaper) {
            return res.status(404).send("Wallpaper not found");
        }

        res.render('index', { page: 'result', wallpaper: wallpaper, user: req.session.user });
    } catch (error) {
        console.error("Error fetching wallpaper details:", error);
        res.status(500).send("Error loading wallpaper details");
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
                user: req.session.user,
                searchQuery
            });
        } else {
            // Handle the case where there is no valid search query
            res.render('index', {
                page: 'search',
                wallpapers: [],
                currentPage: 1,
                totalPages: 1,
                searchQuery: ''
            });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).send('Failed to execute search');
    }
});

router.get('/delete', async (req, res) => {
    try {
        const wallpapers = await Wallpaper.find()
            .populate('uploaderId', 'username')
            .populate('categoryId', 'name'); // Make sure this corresponds to your Category model
        res.render('index', { page:'delete', wallpapers });
    } catch (error) {
        console.error('Failed to fetch wallpapers:', error);
        res.status(500).send('Error loading wallpapers');
    }
});



router.delete('/api/wallpapers/delete/:id', async (req, res) => {
    try {
        const deleted = await Wallpaper.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Wallpaper not found' });
        }
        res.json({ success: true, message: 'Wallpaper deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


router.get('/category/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Number of wallpapers per page
        const skip = (page - 1) * limit;

        const category = await Category.findById(categoryId);  // Find the category to display its name
        const wallpapers = await Wallpaper.find({ categoryId: categoryId })
            .populate('uploaderId')
            .sort({ uploadDate: -1 })
            .skip(skip)
            .limit(limit);
        
        const count = await Wallpaper.countDocuments({ categoryId: categoryId });
        const totalPages = Math.ceil(count / limit);

        res.render('index', {  page: 'categoryresult',// Note: changed from 'index'
            category: category.name, // Now passing the category name
            wallpapers,
            currentPage: page,
            totalPages,
            user: req.session.user
        });
    } catch (error) {
        console.error('Category fetch error:', error);
        res.status(500).send('Error loading category wallpapers');
    }
});

  
module.exports = router;
