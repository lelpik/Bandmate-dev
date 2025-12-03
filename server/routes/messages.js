const express = require("express");
const { pool } = require("../db");
const authenticateToken = require("../middleware/auth");

const router = express.Router();

// Get conversations (users matched with)
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    // Get users who have matched with current user (using matches table)
    const conversations = await pool.query(`
      SELECT u.id, u.username, u.nickname, u.profile_picture, u.bio, u.age, u.instruments, u.genres, u.interests,
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

// Send message (text only)
router.post("/", authenticateToken, async (req, res) => {
  const { receiver_id, content } = req.body;

  if (!receiver_id || !content) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const messageType = 'text';

  try {
    const result = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?)",
      [req.user.id, receiver_id, content, messageType]
    );

    const newMessage = {
      id: Number(result.insertId),
      sender_id: req.user.id,
      receiver_id,
      content: content,
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
