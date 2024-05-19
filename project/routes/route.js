const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const path = require('path');

const router = express.Router();

// Mongo URI
const mongoURI = 'mongodb://localhost:27017/wallpaperDB';

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
    res.render('index', { page: 'home' });
});

// Explore route
router.get('/explore', (req, res) => {
    res.render('index', { page: 'explore' });
});

// Upload GET route to render the upload form
router.get('/upload', async (req, res) => {
  
    res.render('index', { page: 'upload'});
  
});



module.exports = router;
