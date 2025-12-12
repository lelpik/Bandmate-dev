const express = require("express");
const { pool } = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Get conversations (users matched with)
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    // Get users who have matched with current user (using matches table)
    const conversations = await pool.query(`
      SELECT u.id, u.username, u.nickname, u.profile_picture, u.bio, u.age, u.instruments, u.genres, u.interests, u.location_lat, u.location_lon,
             (SELECT content FROM messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id) ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM users u
      JOIN matches m ON (m.user1_id = u.id OR m.user2_id = u.id)
      WHERE (m.user1_id = ? OR m.user2_id = ?) AND u.id != ?
      ORDER BY last_message_time DESC
    `, [
      req.user.id, req.user.id, 
      req.user.id, req.user.id,
      req.user.id, req.user.id, req.user.id
    ]);

    // Helper to ensure parsed JSON
    const parseIfNeeded = (val) => {
        if (typeof val === 'string') {
            try { return JSON.parse(val); } catch(e) { return []; }
        }
        return val || [];
    };

    // Parse JSON fields
    conversations.forEach(user => {
      user.instruments = parseIfNeeded(user.instruments);
      user.genres = parseIfNeeded(user.genres);
      user.interests = parseIfNeeded(user.interests);
    });

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages with a specific user
router.get("/:userId", authenticateToken, async (req, res) => {
  const otherUserId = req.params.userId;

  try {
    const messages = await pool.query(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `, [req.user.id, otherUserId, otherUserId, req.user.id]);
    
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Configure Multer
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Send message (supports file upload)
router.post("/", authenticateToken, upload.single('audio'), async (req, res) => {
  console.log('Received message send request');
  console.log('Body:', req.body);
  console.log('File:', req.file);

  const { receiver_id, content, type } = req.body; // type: 'text' or 'audio'
  const file = req.file;

  if (!receiver_id || (!content && !file)) {
    return res.status(400).json({ error: "Missing fields" });
  }

  let messageContent = content;
  let messageType = type || 'text';

  if (file) {
    messageContent = file.filename; // Store filename
    messageType = 'audio';
  }

  try {
    const result = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?)",
      [req.user.id, receiver_id, messageContent, messageType]
    );

    const newMessage = {
      id: Number(result.insertId),
      sender_id: req.user.id,
      receiver_id,
      content: messageContent,
      type: messageType,
      created_at: new Date().toISOString(),
    };

    // Create notification
    await pool.query(
      "INSERT INTO notifications (user_id, type, content, related_id) VALUES (?, ?, ?, ?)",
      [receiver_id, "message", `New message from ${req.user.username}`, req.user.id]
    );

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
