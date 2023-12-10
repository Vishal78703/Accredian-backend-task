const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json())
app.use(bodyParser.json());

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Vk@7870394803',
  database: 'authentication_db',
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// RESTful endpoint for user registration (Sign-Up)
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into the database
  db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
  [username, email, hashedPassword], 
  (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        // Duplicate entry error (email already exists)
        return res.status(409).json({ error: 'Email already exists' });
      } else {
        // Other database errors
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }

    res.status(201).json({ message: 'User registered successfully' });
  });
});

// RESTful endpoint for user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Received login request for email:', email);

  // Check if the email exists in the database
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      // Email not found
      console.log('Email not found during login');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = results[0];

    // Check if the provided password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Incorrect password
      console.log('Incorrect password during login');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login
    console.log('Login successful');
    res.json({ message: 'Login successful' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

