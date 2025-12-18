const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Allowed Domains Check
  const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me', 'aol.com'];
  const domain = email.split('@')[1];
  if (!domain || !allowedDomains.includes(domain)) {
      return res.status(400).json({ error: 'Email provider not allowed. Please use a major provider.' });
  }

  // Password Strength Validation
  if (password.length < 7) {
    return res.status(400).json({ error: 'Password must be at least 7 characters long' });
  }
  if (!/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one number' });
  }
  if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // MariaDB returns insertId as BigInt, convert to string or number
    const userId = Number(result.insertId);

    const token = jwt.sign({ id: userId, username }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });
    
    res.status(201).json({ token, user: { id: userId, username, email } });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(`[LOGIN_DEBUG] Attempt for email: ${email}`);

  try {
    const rows = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];

    if (!user) {
      console.log(`[LOGIN_DEBUG] User not found for email: ${email}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    console.log(`[LOGIN_DEBUG] User found: ${user.username} (ID: ${user.id})`);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      console.log(`[LOGIN_DEBUG] Password mismatch for user: ${user.username}`);
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    console.log(`[LOGIN_DEBUG] Password verified for user: ${user.username}`);

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });
    
    // Don't send password hash back
    const { password_hash, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error('[LOGIN_DEBUG] Server error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
