const express = require('express');
const { pool } = require('../db');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Swipe action
router.post('/swipe', authenticateToken, async (req, res) => {
  const { likee_id, action } = req.body; // action: 'like' or 'pass'
  const liker_id = req.user.id;

  if (!likee_id || !['like', 'pass'].includes(action)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  try {
    // Record the swipe
    await pool.query(
      'INSERT INTO swipes (liker_id, likee_id, action) VALUES (?, ?, ?)',
      [liker_id, likee_id, action]
    );

    let isMatch = false;

    // If it's a like, check for mutual like
    if (action === 'like') {
      const mutualLike = await pool.query(
        'SELECT * FROM swipes WHERE liker_id = ? AND likee_id = ? AND action = ?',
        [likee_id, liker_id, 'like']
      );

      if (mutualLike.length > 0) {
        isMatch = true;
        
        // Insert into matches table
        await pool.query(
          'INSERT INTO matches (user1_id, user2_id) VALUES (?, ?)',
          [Math.min(liker_id, likee_id), Math.max(liker_id, likee_id)]
        );

        // Log Analytics: Match Formed
        try {
          // Log for liker
          await pool.query(
            "INSERT INTO analytics_events (user_id, event_type, event_data) VALUES (?, ?, ?)",
            [liker_id, 'match_formed', JSON.stringify({ with_user: likee_id })]
          );
        } catch (err) {
          console.error('Analytics Log Error (Match):', err);
        }

        // Create notification for the other user
        // Need to fetch current user's name
        const currentUserRows = await pool.query("SELECT username, nickname FROM users WHERE id = ?", [liker_id]);
        const currentUserName = currentUserRows[0].nickname || currentUserRows[0].username;

        await pool.query(
          'INSERT INTO notifications (user_id, type, content, related_id) VALUES (?, ?, ?, ?)',
          [likee_id, 'match', `You matched with ${currentUserName}!`, liker_id]
        );
        
        // Create notification for current user
        const likeeRows = await pool.query("SELECT username, nickname FROM users WHERE id = ?", [likee_id]);
        const likeeName = likeeRows[0].nickname || likeeRows[0].username;

        await pool.query(
          'INSERT INTO notifications (user_id, type, content, related_id) VALUES (?, ?, ?, ?)',
          [liker_id, 'match', `You matched with ${likeeName}!`, likee_id]
        );
      }
    }

    res.json({ success: true, isMatch });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // Treat duplicate as success (idempotent) so client moves on
      return res.json({ success: true, message: 'Already swiped' });
    }
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get matches
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Find users where both users liked each other (using matches table)
    const matches = await pool.query(`
      SELECT u.id, u.username, u.nickname, u.profile_picture, u.bio, u.age, u.instruments, u.genres, u.interests
      FROM users u
      JOIN matches m ON (m.user1_id = u.id OR m.user2_id = u.id)
      WHERE (m.user1_id = ? OR m.user2_id = ?) AND u.id != ?
    `, [req.user.id, req.user.id, req.user.id]);
    
    // Helper to ensure parsed JSON
    const parseIfNeeded = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch(e) { return []; }
        }
        return val || [];
    };

    matches.forEach(user => {
        user.instruments = parseIfNeeded(user.instruments);
        user.genres = parseIfNeeded(user.genres);
        user.interests = parseIfNeeded(user.interests);
    });

    res.json(matches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
