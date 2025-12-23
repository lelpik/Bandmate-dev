-- Create Database
CREATE DATABASE IF NOT EXISTS bandmate;
USE bandmate;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  nickname VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  bio TEXT,
  location_lat FLOAT,
  location_lon FLOAT,
  instruments JSON,
  genres JSON,
  interests JSON,
  age INT,
  social_links JSON,
  profile_picture TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swipes Table (History of all swipes)
CREATE TABLE IF NOT EXISTS swipes (
  liker_id INT NOT NULL,
  likee_id INT NOT NULL,
  action ENUM('like', 'pass') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (liker_id, likee_id),
  FOREIGN KEY (liker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (likee_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Matches Table (Explicit mutual matches)
CREATE TABLE IF NOT EXISTS matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user1_id INT NOT NULL,
  user2_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_match (user1_id, user2_id),
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT,
  type ENUM('text', 'audio') DEFAULT 'text',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'match', 'message'
  content TEXT,
  related_id INT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  event_type VARCHAR(50) NOT NULL,
  event_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Data
INSERT INTO users (username, nickname, email, password_hash, bio, instruments, genres, interests, age, profile_picture) VALUES
('jimi_hendrix', 'Jimi', 'jimi@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'Guitar legend. Looking for a band to change the world.', '["Guitar", "Vocals"]', '["Rock", "Blues"]', '["Vinyl Collecting", "Meditation"]', 27, 'https://ui-avatars.com/api/?name=Jimi+Hendrix&background=0D8ABC&color=fff'),
('freddie_mercury', 'Freddie', 'freddie@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'I want to break free! Vocalist with a range.', '["Vocals", "Piano"]', '["Rock", "Opera"]', '["Cats", "Fashion"]', 45, 'https://ui-avatars.com/api/?name=Freddie+Mercury&background=FFD700&color=fff'),
('flea', 'Flea', 'flea@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'Slapping da bass. Funk rock enthusiast.', '["Bass", "Trumpet"]', '["Funk", "Rock"]', '["Surfing", "Beekeeping"]', 50, 'https://ui-avatars.com/api/?name=Flea&background=FF0000&color=fff'),
('dave_grohl', 'Dave', 'dave@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'I play everything. Lets make some noise.', '["Drums", "Guitar", "Vocals"]', '["Rock", "Grunge"]', '["Coffee", "BBQ"]', 52, 'https://ui-avatars.com/api/?name=Dave+Grohl&background=000000&color=fff'),
('stevie_nicks', 'Stevie', 'stevie@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'Thunder only happens when its raining. Gypsy soul.', '["Vocals", "Tambourine"]', '["Rock", "Pop"]', '["Poetry", "Witchcraft"]', 70, 'https://ui-avatars.com/api/?name=Stevie+Nicks&background=800080&color=fff'),
('prince', 'The Artist', 'prince@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'Dearly beloved, we are gathered here today to get through this thing called life.', '["Guitar", "Vocals", "Piano", "Bass", "Drums"]', '["Funk", "Pop", "Rock"]', '["Purple", "Motorcycles"]', 57, 'https://ui-avatars.com/api/?name=Prince&background=4B0082&color=fff'),
('kurt_cobain', 'Kurt', 'kurt@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'Come as you are.', '["Guitar", "Vocals"]', '["Grunge", "Rock"]', '["Art", "Writing"]', 27, 'https://ui-avatars.com/api/?name=Kurt+Cobain&background=556B2F&color=fff'),
('janis_joplin', 'Pearl', 'janis@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'Take another little piece of my heart.', '["Vocals"]', '["Blues", "Rock", "Soul"]', '["Feathers", "Cars"]', 27, 'https://ui-avatars.com/api/?name=Janis+Joplin&background=FF69B4&color=fff'),
('bb_king', 'B.B.', 'bb@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'The thrill is gone.', '["Guitar", "Vocals"]', '["Blues"]', '["Lucille", "Touring"]', 80, 'https://ui-avatars.com/api/?name=BB+King&background=000080&color=fff'),
('miles_davis', 'Miles', 'miles@example.com', '$2b$10$qFia0YXLM1HXsXpSTJH2C.UcWyBNlCU/i9II7KFuLvhCnAj6K6dAK', 'So What.', '["Trumpet"]', '["Jazz", "Fusion"]', '["Boxing", "Painting"]', 65, 'https://ui-avatars.com/api/?name=Miles+Davis&background=000000&color=fff');
