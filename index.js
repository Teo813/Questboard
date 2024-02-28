require('dotenv').config();
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
const selectQuery = 'SELECT * FROM users WHERE username = $1';
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
app.post('/create-character', async (req, res) => {

  if (!req.session.userId) {
    return res.status(403).send({ status: 'error', message: 'You must be logged in to create a post.' });
  }
  const { charactername, characterdescription } = req.body;
  const userid = req.session.userId; // Assuming you store userid in session

  try {
    const newCharacter = await pool.query(
      `INSERT INTO characters (userid, charactername, characterdescription) VALUES ($1, $2, $3) RETURNING *`,
      [userid, charactername, characterdescription]
    );
    res.json({ message: 'Character created successfully!', character: newCharacter.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

//New Posts
app.post('/submit-post', (req, res) => {
  // First, check if the user is logged in
  if (!req.session.userId) {
    return res.status(403).send({ status: 'error', message: 'You must be logged in to create a post.' });
  }

  // Extracting form data
  const { characterid, text, tags } = req.body;
  const userid = req.session.userId; // Using the logged-in user's ID from the session

  // Inserting post data into the database
  const insertQuery = 'INSERT INTO posts(userid, characterid, text, tags) VALUES($1, $2, $3, $4) RETURNING *';
  pool.query(insertQuery, [userid, characterid, text, tags], (error, results) => {
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
    const query = `
      SELECT p.postid, p.text, p.tags, p.createdat AT TIME ZONE 'EST' as createdat, c.charactername
      FROM posts p
      INNER JOIN characters c ON p.characterid = c.characterid
      ORDER BY p.createdat DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/', (req, res) => {
  console.log(req.session.userId);
  if (req.session.userId) {
    // User is logged in
    res.send("/index.html");
  } else {
    // User is not logged in
    res.send(`
      <h1>Login Required</h1>
      <p>Please <a href="/login.html">login</a> to view this page.</p>
    `);
  }
});
app.get('/page', (req, res) => {

});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = pool;