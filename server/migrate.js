const { db } = require('./db');

try {
  db.prepare("ALTER TABLE users ADD COLUMN nickname TEXT").run();
  console.log("Added nickname column to users table.");
} catch (error) {
  if (error.message.includes("duplicate column name")) {
    console.log("Nickname column already exists.");
  } else {
    console.error("Error adding nickname column:", error);
  }
}
