const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');



const app = express();

// Connect to MongoDB

mongoose.connect("mongodb://localhost:27017/wallpapers").then((data) => {
  console.log("DB Connected");
});

// Middleware
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

// Set view engine and views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routes
const Router = require('./routes/route');
const router = require('./routes/route');

//const uploadRouter = require('./routes/upload');



app.use('/', Router);
app.use('/explore', Router);
app.use('/categories', Router);
app.use('/upload', router);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
