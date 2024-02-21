const pool = require('./index');

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Ensure you store hashed passwords, not plain text
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

pool.query(createUsersTable)
  .then(res => {
    console.log("Users table created successfully.");
    pool.end(); // Closes the pool connection to the database
  })
  .catch(err => {
    console.error("Error creating users table:", err);
    pool.end(); // Closes the pool connection to the database
  });
