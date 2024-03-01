require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const { Pool } = require('pg');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/profilePics', express.static('profilePics'));
app.use('/postImages', express.static('postImages'));


const pool = new Pool({
  user: 'llmysts',
  host: 'localhost',
  database: 'questboard',
  password: 'admin',
  port: 5432,
});
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET, // Use a long, random string here
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 } // For HTTPS use secure: true
}));
//Image Handling
// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'profilePics/'); // Set the destination directory
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Use the field name, current timestamp, and original extension for the filename
  }
});

// Storage configuration for profile pictures
const profilePicStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'profilePics/';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Storage configuration for post images
const postImageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = 'postImages/';
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize multer with different storage configurations
const uploadProfilePic = multer({
  storage: profilePicStorage,
  limits: { fileSize: 40 * 1024 * 1024 }, // Limit file size to 40MB
  fileFilter: function(req, file, cb) {
  checkFileType(file, cb);
} });
const uploadPostImage = multer({
  storage: postImageStorage,
  limits: { fileSize: 40 * 1024 * 1024 }, // Limit file size to 40MB
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
} });

// Function to check file type
function checkFileType(file, cb) {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mimetype
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!'); // Reject file if it doesn't meet the criteria
  }
}

//User Registration
app.post('/register', (req, res) => {
    // In a real app, you would save the user info to a database
    const { username, password, email } = req.body;
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            return res.status(500).send({ status: 'error', message: 'Error hashing password' });
        }
        const insertQuery = 'INSERT INTO users(username, password, email) VALUES($1, $2, $3) RETURNING *';
        pool.query(insertQuery, [username, hash, email], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return res.status(500).send({ status: 'error', message: error });
            }else{
            res.status(201).send({ status: 'success', message: 'User registered!', userId: results.rows[0].id });
            }
        });
    });

    console.log('Registering user:', req.body);
    // Removed the redundant res.send() to prevent ERR_HTTP_HEADERS_SENT error
  });
//User Login
app.post('/login', (req, res) => {
  const { username, password} = req.body;
  const selectQuery = 'SELECT * FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)';
pool.query(selectQuery, [username], (error, results) => {
  if (error) {
    console.error('Database error:', error);
    return res.status(500).send({ status: 'error', message: 'Database error' });
  }
  if (results.rows.length > 0) {
    const user = results.rows[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Bcrypt error:', err);
        return res.status(500).send({ status: 'error', message: 'Error checking password' });
      }
      if (isMatch) {
        // Passwords match, set up session
        req.session.userId = user.id; // Save user id in session
        req.session.username = username; // Optionally save other user details in session
        console.log('Login successful for:', username);

        return res.status(200).send({ status: 'success', message: 'Logged in successfully' });
      } else {
        // Passwords do not match
        return res.status(401).send({ status: 'error', message: 'Incorrect password' });
      }
    });
  } else {
    return res.status(404).send({ status: 'error', message: 'User not found' });
  }
});
});
//User Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    console.log("logged out");
    if (err) {
      console.error('Logout failed:', err);
      return res.status(500).send('Could not log out, please try again.');
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect('/'); // Redirect to the home page or login page
  });
});
//Create Character
app.post('/create-character', uploadProfilePic.single('characterimage'), async (req, res) => {
  if (!req.session.userId) {
    return res.status(403).send({ status: 'error', message: 'You must be logged in to create a character.' });
  }
  const { charactername, characterdescription } = req.body;
  const userid = req.session.userId;
  console.log(req.file);
  const characterImageUrl = req.file ? req.file.path : null; // Path to the uploaded file

  try {
    const newCharacter = await pool.query(
      `INSERT INTO characters (userid, charactername, characterdescription, characterimageurl) VALUES ($1, $2, $3, $4) RETURNING *`,
      [userid, charactername, characterdescription, characterImageUrl]
    );
    res.json({ message: 'Character created successfully!', character: newCharacter.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

//New Posts
app.post('/submit-post', uploadPostImage.single('postImage'), (req, res) => {
  if (!req.session.userId) {
    return res.status(403).send({ status: 'error', message: 'You must be logged in to create a post.' });
  }

  const { characterid, text, tags } = req.body;
  const userid = req.session.userId; // Using the logged-in user's ID from the session
  const imageUrl = req.file ? req.file.path : null; // Path to the uploaded image or null

  // Inserting post data into the database including the image URL
  const insertQuery = 'INSERT INTO posts(userid, characterid, text, tags, image_url) VALUES($1, $2, $3, $4, $5) RETURNING *';
  pool.query(insertQuery, [userid, characterid, text, tags, imageUrl], (error, results) => {
    if (error) {
      console.error('Database error:', error);
      return res.status(500).send({ status: 'error', message: 'Database error' });
    }
    // Successfully inserted the post
    res.status(201).send({ status: 'success', message: 'Post created successfully!', post: results.rows[0] });
  });
});

//Show all posts
app.get('/posts', async (req, res) => {
  try {
    // Updated query to include p.image_url and removed the trailing comma before FROM
    const query = `
      SELECT p.postid, p.text, p.tags, p.image_url, p.createdat AT TIME ZONE 'EST' as createdat, c.charactername, c.characterimageurl
      FROM posts p
      INNER JOIN characters c ON p.characterid = c.characterid
      ORDER BY p.createdat DESC
    `;
    const { rows } = await pool.query(query);
    rows.forEach(row => {
      // Update the path for character images and post images based on your server's static files configuration
      if (row.characterimageurl) {
        row.characterimageurl = `/${row.characterimageurl}`;
      }
      // Conditionally prefix the image URL if it exists
      if (row.image_url) {
        row.image_url = `/${row.image_url}`;
      }
    });
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
});


//Finding User Characters for post creation
app.get('/get-user-characters', async (req, res) => {
  console.log("Index.js looking for characters")
  try {
    const userId = req.session.userId;
    const query = 'SELECT characterid, charactername FROM characters WHERE userid = $1';
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
//Getting user characters for displaying
app.get('/get-user-characters-full', async (req, res) => {
  console.log("Index.js looking for characters");
  try {
    // Ensure the user is logged in before fetching characters
    if (!req.session.userId) {
      return res.status(403).send({ status: 'error', message: 'You must be logged in to view characters.' });
    }

    const userId = req.session.userId;
    // Updated query to include characterdescription and characterimageurl
    const query = 'SELECT characterid, charactername, characterdescription, characterimageurl FROM characters WHERE userid = $1';
    const { rows } = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
//checking login status
app.get('/check-session', (req, res) => {
  if (req.session.userId) {
    // Assuming you have a users table with columns for username and profilePicPath
    const selectQuery = 'SELECT username FROM users WHERE id = $1';

    pool.query(selectQuery, [req.session.userId], (error, results) => {
      if (error) {
        console.error('Database error:', error);
        return res.status(500).send({ status: 'error', message: 'Database error' });
      }
      if (results.rows.length > 0) {
        const user = results.rows[0];
        res.json({
          isLoggedIn: true,
          username: user.username,
          //profilePicPath: user.profilepicpath // Ensure this path is correctly served by your static files middleware
        });
      } else {
        // User ID in session but no corresponding user in the database
        res.json({ isLoggedIn: false });
      }
    });
  } else {
    // No user ID in session, user is not logged in
    res.json({ isLoggedIn: false });
  }
});
//Delete Characters
app.delete('/delete-character/:characterId', async (req, res) => {
  if (!req.session.userId) {
      return res.status(403).send({ status: 'error', message: 'You must be logged in to delete a character.' });
  }

  const { characterId } = req.params;
  const userId = req.session.userId;

  try {
      // Optional: Check if the character belongs to the logged-in user
      const ownershipQuery = 'SELECT userid FROM characters WHERE characterid = $1';
      const ownershipResult = await pool.query(ownershipQuery, [characterId]);

      if (ownershipResult.rows.length > 0 && ownershipResult.rows[0].userid === userId) {
          const deleteQuery = 'DELETE FROM characters WHERE characterid = $1 AND userid = $2';
          await pool.query(deleteQuery, [characterId, userId]);
          res.json({ status: 'success', message: 'Character deleted successfully' });
      } else {
          res.status(404).send({ status: 'error', message: 'Character not found or you do not have permission to delete this character.' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).send({ status: 'error', message: 'Server error' });
  }
});
app.put('/update-character/:characterId', uploadProfilePic.single('characterimage'), async (req, res) => {
  if (!req.session.userId) {
      return res.status(403).send({ status: 'error', message: 'You must be logged in to update a character.' });
  }

  const { characterId } = req.params;
  const userId = req.session.userId;
  const charactername = req.body.charactername;
  const characterdescription = req.body.characterdescription;
  const characterImageUrl = req.file ? req.file.path : null; // New image file path if an image was uploaded

  try {
      // Check if the character belongs to the logged-in user
      const ownershipQuery = 'SELECT userid FROM characters WHERE characterid = $1';
      const ownershipResult = await pool.query(ownershipQuery, [characterId]);

      if (ownershipResult.rows.length > 0 && ownershipResult.rows[0].userid === userId) {
          let updateQuery, queryParams;
          if (characterImageUrl) {
              // If a new image was uploaded, include it in the update
              updateQuery = `
                  UPDATE characters
                  SET charactername = $1, characterdescription = $2, characterimageurl = $3
                  WHERE characterid = $4 AND userid = $5
                  RETURNING *;
              `;
              queryParams = [charactername, characterdescription, characterImageUrl, characterId, userId];
          } else {
              // If no new image was uploaded, only update the name and description
              updateQuery = `
                  UPDATE characters
                  SET charactername = $1, characterdescription = $2
                  WHERE characterid = $3 AND userid = $4
                  RETURNING *;
              `;
              queryParams = [charactername, characterdescription, characterId, userId];
          }

          const { rows } = await pool.query(updateQuery, queryParams);

          if (rows.length > 0) {
              res.json({ status: 'success', message: 'Character updated successfully', character: rows[0] });
          } else {
              res.status(404).send({ status: 'error', message: 'Character not found or you do not have permission to update this character.' });
          }
      } else {
          res.status(404).send({ status: 'error', message: 'Character not found or you do not have permission to update this character.' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).send({ status: 'error', message: 'Server error' });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = pool;