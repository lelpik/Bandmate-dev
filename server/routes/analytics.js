const express = require('express');
const router = express.Router();
const { pool } = require('../db');

const jwt = require('jsonwebtoken');

// POST /api/analytics/log
router.post('/log', async (req, res) => {
  console.log('[Analytics-Server] Received Log Request:', req.body);
  console.log('[Analytics-Server] Auth Header:', req.headers.authorization);

  const { event_type, event_data } = req.body;
  
  let user_id = req.body.user_id || null;

  // Try to extract user from token if not explicitly provided
  if (!user_id && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        user_id = decoded.id;
        console.log('[Analytics-Server] Decoded User ID from Token:', user_id);
      } catch (err) {
        console.warn('[Analytics-Server] Token verification failed:', err.message);
      }
    }
  }

  console.log(`[Analytics-Server] Final Insert - User: ${user_id}, Type: ${event_type}`);

  try {
    await pool.query(
      "INSERT INTO analytics_events (user_id, event_type, event_data) VALUES (?, ?, ?)",
      [user_id, event_type, JSON.stringify(event_data || {})]
    );
    console.log('[Analytics-Server] DB Insert Successful');
    res.status(201).json({ message: 'Event logged' });
  } catch (err) {
    console.error('[Analytics-Server] DB Error:', err);
    res.status(500).json({ error: 'Failed to log event' });
  }
});



module.exports = router;
