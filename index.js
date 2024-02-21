const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 3000;
const { Pool } = require('pg');

const pool = new Pool({
  user: 'llmysts',
  host: '2601:cd:c600:9220:aa60:b6ff:fe3c:369e',
  database: 'questBoard',
  password: 'admin',
  port: 5432,
});
app.use(express.static('public'));

//User Registration
app.post('/register', (req, res) => {
    // In a real app, you would save the user info to a database

    console.log('Registering user:', req.body);
    res.send({ status: 'success', message: 'User registered!' });
  });
  
//User Logins


app.get('/', (req, res) => {
  res.send('Hello, D&D Forum!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
module.exports = pool;

