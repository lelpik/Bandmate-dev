const express = require('express');
const { pool } = require('../db');
const authenticateToken = require('../middleware/auth');
const bcrypt = require('bcrypt');

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const rows = await pool.query('SELECT id, username, nickname, email, bio, location_lat, location_lon, instruments, genres, interests, age, social_links, profile_picture FROM users WHERE id = ?', [req.user.id]);
    const user = rows[0];
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Helper to ensure parsed JSON
    const parseIfNeeded = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch(e) { return []; }
        }
        return val || [];
    };

    user.instruments = parseIfNeeded(user.instruments);
    user.genres = parseIfNeeded(user.genres);
    user.interests = parseIfNeeded(user.interests);
    user.social_links = parseIfNeeded(user.social_links);
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Configure Multer (Same as before)
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Update profile
router.put('/me', authenticateToken, upload.single('profile_picture'), async (req, res) => {
  console.log('Received profile update request');
  console.log('Body:', req.body);
  console.log('File:', req.file);
  
  const { username, nickname, bio, location_lat, location_lon, instruments, genres, interests, age, social_links } = req.body;
  const userId = req.user.id;
  const file = req.file;

  try {
    // Parse JSON fields if they are strings (Multipart form data sends everything as strings)
    const parsedInstruments = typeof instruments === 'string' ? JSON.parse(instruments) : instruments;
    const parsedGenres = typeof genres === 'string' ? JSON.parse(genres) : genres;
    const parsedInterests = typeof interests === 'string' ? JSON.parse(interests) : interests;
    const parsedSocialLinks = typeof social_links === 'string' ? JSON.parse(social_links) : social_links;

    // Validation (basic)
    if (parsedInstruments && parsedInstruments.length > 5) return res.status(400).json({ error: 'Max 5 instruments' });
    if (parsedGenres && parsedGenres.length > 5) return res.status(400).json({ error: 'Max 5 genres' });

    let profilePictureUrl = req.body.profile_picture; // If sending URL directly (legacy)
    if (file) {
      profilePictureUrl = `http://localhost:3000/uploads/${file.filename}`;
    }

    await pool.query(`
      UPDATE users
      SET username = COALESCE(?, username),
          nickname = COALESCE(?, nickname),
          bio = COALESCE(?, bio),
          location_lat = COALESCE(?, location_lat),
          location_lon = COALESCE(?, location_lon),
          instruments = COALESCE(?, instruments),
          genres = COALESCE(?, genres),
          interests = COALESCE(?, interests),
          age = COALESCE(?, age),
          social_links = COALESCE(?, social_links),
          profile_picture = COALESCE(?, profile_picture)
      WHERE id = ?
    `, [
      username,
      nickname,
      bio,
      location_lat,
      location_lon,
      JSON.stringify(parsedInstruments),
      JSON.stringify(parsedGenres),
      JSON.stringify(parsedInterests),
      age,
      JSON.stringify(parsedSocialLinks),
      profilePictureUrl,
      userId
    ]);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Username already taken' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update account settings (email, password)
router.put('/account', authenticateToken, async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!email && !newPassword) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  // Allowed Domains Check for email update
  if (email) {
      const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me', 'aol.com'];
      const domain = email.split('@')[1];
      if (!domain || !allowedDomains.includes(domain)) {
          return res.status(400).json({ error: 'Email provider not allowed. Please use a major provider.' });
      }
  }

  try {
    // Verify current password if changing sensitive info
    if (newPassword || email) {
       if (!currentPassword) {
         return res.status(400).json({ error: 'Current password required' });
       }
       
       const userRows = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
       const user = userRows[0];
       
       const match = await bcrypt.compare(currentPassword, user.password_hash);
       if (!match) {
         return res.status(400).json({ error: 'Invalid current password' });
       }
    }

    let updateQuery = 'UPDATE users SET ';
    const params = [];

    if (email) {
      updateQuery += 'email = ?, ';
      params.push(email);
    }

    if (newPassword) {
        // Password Strength Validation
        if (newPassword.length < 7) {
            return res.status(400).json({ error: 'New password must be at least 7 characters long' });
        }
        if (!/[0-9]/.test(newPassword)) {
            return res.status(400).json({ error: 'New password must contain at least one number' });
        }
        if (!/[A-Z]/.test(newPassword)) {
            return res.status(400).json({ error: 'New password must contain at least one uppercase letter' });
        }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateQuery += 'password_hash = ?, ';
      params.push(hashedPassword);
    }

    // Remove trailing comma and space
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ' WHERE id = ?';
    params.push(userId);

    await pool.query(updateQuery, params);
    res.json({ success: true });

  } catch (error) {
    console.error('Error updating account:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Discovery: Get potential matches
router.get('/discover', authenticateToken, async (req, res) => {
  try {
    // Get users who are NOT the current user and have NOT been swiped on by the current user
    const users = await pool.query(`
      SELECT id, username, nickname, bio, location_lat, location_lon, instruments, genres, interests, age, social_links, profile_picture 
      FROM users 
      WHERE id != ? 
      AND id NOT IN (SELECT likee_id FROM swipes WHERE liker_id = ?)
      LIMIT 20
    `, [req.user.id, req.user.id]);
    
    // Helper to ensure parsed JSON
    const parseIfNeeded = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch(e) { return []; }
        }
        return val || [];
    };

    // Parse JSON fields
    users.forEach(user => {
      user.instruments = parseIfNeeded(user.instruments);
      user.genres = parseIfNeeded(user.genres);
      user.interests = parseIfNeeded(user.interests);
      user.social_links = parseIfNeeded(user.social_links);
    });
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
